import WS from 'ws'
import moment, { Moment } from 'moment'
import { v4 as uuid } from 'uuid'
import { EventEmitter } from 'events'
import { WebSocketInterface } from '../megalodon'
import MisskeyAPI from './api_client'

export default class WebSocket extends EventEmitter implements WebSocketInterface {
  public url: string
  public channel: 'user' | 'localTimeline' | 'hybridTimeline' | 'globalTimeline' | 'conversation' | 'list'
  public parser: Parser
  public listId: string | null = null
  private _accessToken: string
  private _reconnectInterval: number
  private _reconnectMaxAttempts: number
  private _reconnectCurrentAttempts: number
  private _connectionClosed: boolean
  private _client: WS | null = null
  private _channelID: string
  private _pongReceivedTimestamp: Moment
  private _heartbeatInterval: number = 60000
  private _pongWaiting: boolean = false

  constructor(
    url: string,
    channel: 'user' | 'localTimeline' | 'hybridTimeline' | 'globalTimeline' | 'conversation' | 'list',
    accessToken: string,
    listId?: string | null
  ) {
    super()
    this.url = url
    this.parser = new Parser()
    this.channel = channel
    if (listId) {
      this.listId = listId
    }
    this._accessToken = accessToken
    this._reconnectInterval = 10000
    this._reconnectMaxAttempts = Infinity
    this._reconnectCurrentAttempts = 0
    this._connectionClosed = false
    this._channelID = uuid()
    this._pongReceivedTimestamp = moment()
  }

  public start() {
    this._connectionClosed = false
    this._resetRetryParams()
    this._startWebSocketConnection()
  }

  private _startWebSocketConnection() {
    this._resetConnection()
    this._setupParser()
    this._client = this._connect()
    this._bindSocket(this._client)
  }

  public stop() {
    this._connectionClosed = true
    this._resetConnection()
    this._resetRetryParams()
  }

  private _resetConnection() {
    if (this._client) {
      this._client.close(100)
      this._client.removeAllListeners()
      this._client = null
    }

    if (this.parser) {
      this.parser.removeAllListeners()
    }
  }

  private _resetRetryParams() {
    this._reconnectCurrentAttempts = 0
  }

  private _connect(): WS {
    const cli: WS = new WS(`${this.url}?i=${this._accessToken}`)
    return cli
  }

  private _channel() {
    if (!this._client) {
      return
    }
    switch (this.channel) {
      case 'conversation':
        this._client.send(
          JSON.stringify({
            type: 'connect',
            body: {
              channel: 'main',
              id: this._channelID
            }
          })
        )
        break
      case 'user':
        this._client.send(
          JSON.stringify({
            type: 'connect',
            body: {
              channel: 'main',
              id: this._channelID
            }
          })
        )
        this._client.send(
          JSON.stringify({
            type: 'connect',
            body: {
              channel: 'homeTimeline',
              id: this._channelID
            }
          })
        )
        break
      case 'list':
        this._client.send(
          JSON.stringify({
            type: 'connect',
            body: {
              channel: 'userList',
              id: this._channelID,
              params: {
                listId: this.listId
              }
            }
          })
        )
        break
      default:
        this._client.send(
          JSON.stringify({
            type: 'connect',
            body: {
              channel: this.channel,
              id: this._channelID
            }
          })
        )
        break
    }
  }

  private _reconnect() {
    setTimeout(() => {
      // Skip reconnect when client is connecting.
      // https://github.com/websockets/ws/blob/7.2.1/lib/websocket.js#L365
      if (this._client && this._client.readyState === WS.CONNECTING) {
        return
      }

      if (this._reconnectCurrentAttempts < this._reconnectMaxAttempts) {
        this._reconnectCurrentAttempts++
        this._clearBinding()
        if (this._client) {
          // In reconnect, we want to close the connection immediately,
          // because recoonect is necessary when some problems occur.
          this._client.terminate()
        }
        // Call connect methods
        console.log('Reconnecting')
        this._client = this._connect()
        this._bindSocket(this._client)
      }
    }, this._reconnectInterval)
  }

  private _clearBinding() {
    if (this._client) {
      this._client.removeAllListeners('close')
      this._client.removeAllListeners('pong')
      this._client.removeAllListeners('open')
      this._client.removeAllListeners('message')
      this._client.removeAllListeners('error')
    }
  }

  private _bindSocket(client: WS) {
    client.on('close', (code: number, _reason: string) => {
      if (code === 1000) {
        this.emit('close', {})
      } else {
        console.log(`Closed connection with ${code}`)
        if (!this._connectionClosed) {
          this._reconnect()
        }
      }
    })
    client.on('pong', () => {
      this._pongWaiting = false
      this.emit('pong', {})
      this._pongReceivedTimestamp = moment()
      // It is required to anonymous function since get this scope in checkAlive.
      setTimeout(() => this._checkAlive(this._pongReceivedTimestamp), this._heartbeatInterval)
    })
    client.on('open', () => {
      this.emit('connect', {})
      this._channel()
      // Call first ping event.
      setTimeout(() => {
        client.ping('')
      }, 10000)
    })
    client.on('message', (data: WS.Data) => {
      this.parser.parse(data, this._channelID)
    })
    client.on('error', (err: Error) => {
      this.emit('error', err)
    })
  }

  private _setupParser() {
    this.parser.on('update', (note: MisskeyAPI.Entity.Note) => {
      this.emit('update', MisskeyAPI.Converter.note(note))
    })
    this.parser.on('notification', (notification: MisskeyAPI.Entity.Notification) => {
      this.emit('notification', MisskeyAPI.Converter.notification(notification))
    })
    this.parser.on('conversation', (note: MisskeyAPI.Entity.Note) => {
      this.emit('conversation', MisskeyAPI.Converter.noteToConversation(note))
    })
    this.parser.on('error', (err: Error) => {
      this.emit('parser-error', err)
    })
  }

  /**
   * Call ping and wait to pong.
   */
  private _checkAlive(timestamp: Moment) {
    const now: Moment = moment()
    // Block multiple calling, if multiple pong event occur.
    // It the duration is less than interval, through ping.
    if (now.diff(timestamp) > this._heartbeatInterval - 1000 && !this._connectionClosed) {
      // Skip ping when client is connecting.
      // https://github.com/websockets/ws/blob/7.2.1/lib/websocket.js#L289
      if (this._client && this._client.readyState !== WS.CONNECTING) {
        this._pongWaiting = true
        this._client.ping('')
        setTimeout(() => {
          if (this._pongWaiting) {
            this._pongWaiting = false
            this._reconnect()
          }
        }, 10000)
      }
    }
  }
}

/**
 * Parser
 * This class provides parser for websocket message.
 */
export class Parser extends EventEmitter {
  /**
   * @param message Message body of websocket.
   */
  public parse(message: WS.Data, channelID: string) {
    if (typeof message !== 'string') {
      this.emit('heartbeat', {})
      return
    }

    if (message === '') {
      this.emit('heartbeat', {})
      return
    }

    let obj: {
      type: string
      body: {
        id: string
        type: string
        body: any
      }
    }
    let body: {
      id: string
      type: string
      body: any
    }

    try {
      obj = JSON.parse(message)
      if (obj.type !== 'channel') {
        return
      }
      if (!obj.body) {
        return
      }
      body = obj.body
      if (body.id !== channelID) {
        return
      }
    } catch (err) {
      this.emit('error', new Error(`Error parsing websocket reply: ${message}, error message: ${err}`))
      return
    }

    switch (body.type) {
      case 'note':
        this.emit('update', body.body as MisskeyAPI.Entity.Note)
        break
      case 'notification':
        this.emit('notification', body.body as MisskeyAPI.Entity.Notification)
        break
      case 'mention': {
        const note = body.body as MisskeyAPI.Entity.Note
        if (note.visibility === 'specified') {
          this.emit('conversation', note)
        }
        break
      }
      case 'renote':
      case 'followed':
      case 'receiveFollowRequest':
      case 'meUpdated':
      case 'readAllNotifications':
      case 'readAllUnreadSpecifiedNotes':
      case 'readAllAntennas':
      case 'readAllUnreadMentions':
        // Ignore these events
        break
      default:
        this.emit('error', new Error(`Unknown event has received: ${JSON.stringify(body)}`))
        break
    }
  }
}
