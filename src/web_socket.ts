import { client, connection, IMessage } from 'websocket'
import { EventEmitter } from 'events'
import Status from './entities/status'
import Notification from './entities/notification'
import Conversation from './entities/conversation'

/**
 * WebSocket
 * Pleroma is not support streaming. It is support websocket instead of streaming.
 * So this class connect to Phoenix websocket for Pleroma.
 */
export default class WebSocket extends EventEmitter {
  public url: string
  public stream: string
  public parser: Parser
  private _accessToken: string
  private _socketConnection: connection | null
  private _reconnectInterval: number
  private _reconnectMaxAttempts: number
  private _reconnectCurrentAttempts: number
  private _connectionClosed: boolean

  /**
   * @param url Full url of websocket: e.g. https://pleroma.io/api/v1/streaming
   * @param stream Stream name, please refer: https://git.pleroma.social/pleroma/pleroma/blob/develop/lib/pleroma/web/mastodon_api/mastodon_socket.ex#L19-28
   * @param accessToken The access token.
   */
  constructor(url: string, stream: string, accessToken: string) {
    super()
    this.url = url
    this.stream = stream
    this.parser = new Parser()
    this._accessToken = accessToken
    this._socketConnection = null
    this._reconnectInterval = 1000
    this._reconnectMaxAttempts = Infinity
    this._reconnectCurrentAttempts = 0
    this._connectionClosed = false
  }

  /**
   * Start websocket connection.
   */
  public start() {
    this._connectionClosed = false
    this._resetRetryParams()
    this._startWebSocketConnection()
  }

  /**
   * Reset connection and start new websocket connection.
   */
  private _startWebSocketConnection() {
    this._resetConnection()
    this._setupParser()
    const cli = this._getClient()
    this._connect(cli, this.url, this.stream, this._accessToken)
  }

  /**
   * Stop current connection.
   */
  public stop() {
    if (this._socketConnection) {
      this._connectionClosed = true
      this._socketConnection.close()
    }
    this._resetRetryParams()
  }

  /**
   * Clean up current connection, and listeners.
   */
  private _resetConnection() {
    if (this._socketConnection) {
      this._socketConnection.removeAllListeners()
      this._socketConnection.close()
    }

    if (this.parser) {
      this.parser.removeAllListeners()
    }
  }

  /**
   * Resets the parameters used in reconnect.
   */
  private _resetRetryParams() {
    this._reconnectCurrentAttempts = 0
  }

  /**
   * Reconnects to the same endpoint.
   */
  private _reconnect(cli: client) {
    setTimeout(() => {
      if (this._reconnectCurrentAttempts < this._reconnectMaxAttempts) {
        this._reconnectCurrentAttempts++
        // Call connect methods
        console.log('Reconnecting')
        this._connect(cli, this.url, this.stream, this._accessToken)
      }
    }, this._reconnectInterval)
  }

  private _connect(cli: client, url: string, stream: string, accessToken: string) {
    const params = [`stream=${stream}`]

    if (accessToken !== null) {
      params.push(`access_token=${accessToken}`)
    }
    const req_url: string = `${url}/?${params.join('&')}`
    cli.connect(req_url)
  }

  /**
   * Prepare websocket client.
   * @param url Full url of websocket: e.g. https://pleroma.io/api/v1/streaming
   * @param stream Stream name, please refer: https://git.pleroma.social/pleroma/pleroma/blob/develop/lib/pleroma/web/mastodon_api/mastodon_socket.ex#L19-28
   * @param accessToken The access token.
   * @returns A Client instance of websocket.
   */
  private _getClient(): client {
    const cli = new client()
    cli.on('connectFailed', err => {
      console.error(err)
      this._reconnect(cli)
    })
    cli.on('connect', conn => {
      this._socketConnection = conn
      this.emit('connect', {})
      conn.on('error', err => {
        this.emit('error', err)
      })
      conn.on('close', code => {
        // Refer the code: https://tools.ietf.org/html/rfc6455#section-7.4
        if (code === 1000) {
          this.emit('close', {})
        } else {
          console.log(`Closed connection with ${code}`)
          // If already called close method, it does not retry.
          if (!this._connectionClosed) {
            this._reconnect(cli)
          }
        }
      })
      conn.on('message', (message: IMessage) => {
        this.parser.parser(message)
      })
    })

    return cli
  }

  /**
   * Set up parser when receive message.
   */
  private _setupParser() {
    this.parser.on('update', (status: Status) => {
      this.emit('update', status)
    })
    this.parser.on('notification', (notification: Notification) => {
      this.emit('notification', notification)
    })
    this.parser.on('delete', (id: string) => {
      this.emit('delete', id)
    })
    this.parser.on('conversation', (conversation: Conversation) => {
      this.emit('conversation', conversation)
    })
    this.parser.on('error', (err: Error) => {
      this.emit('parser-error', err)
    })
    this.parser.on('heartbeat', _ => {
      this.emit('heartbeat', 'heartbeat')
    })
  }
}

/**
 * Parser
 * This class provides parser for websocket message.
 */
class Parser extends EventEmitter {
  constructor() {
    super()
  }

  /**
   * @param message Message body of websocket.
   */
  public parser(message: IMessage) {
    if (!message.utf8Data) {
      this.emit('heartbeat', {})
      return
    }
    const data = message.utf8Data
    if (data === '') {
      this.emit('heartbeat', {})
      return
    }

    let event = ''
    let payload = ''
    let mes = {}
    try {
      const obj = JSON.parse(data)
      event = obj.event
      payload = obj.payload
      mes = JSON.parse(payload)
    } catch (err) {
      // delete event does not have json object
      if (event !== 'delete') {
        this.emit('error', new Error(`Error parsing websocket reply: ${data}, error message: ${err}`))
        return
      }
    }

    switch (event) {
      case 'update':
        this.emit('update', mes as Status)
        break
      case 'notification':
        this.emit('notification', mes as Notification)
        break
      case 'conversation':
        this.emit('conversation', mes as Conversation)
        break
      case 'delete':
        this.emit('delete', payload)
        break
      default:
        this.emit('error', new Error(`Unknown event has received: ${data}`))
    }
    return
  }
}
