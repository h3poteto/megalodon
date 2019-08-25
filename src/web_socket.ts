import WS from 'ws'
import { EventEmitter } from 'events'
import { Status } from './entities/status'
import { Notification } from './entities/notification'
import { Conversation } from './entities/conversation'

/**
 * WebSocket
 * Pleroma is not support streaming. It is support websocket instead of streaming.
 * So this class connect to Phoenix websocket for Pleroma.
 */
export default class WebSocket extends EventEmitter {
  public url: string
  public stream: string
  public parser: Parser
  public headers: { [key: string]: string }
  private _accessToken: string
  private _reconnectInterval: number
  private _reconnectMaxAttempts: number
  private _reconnectCurrentAttempts: number
  private _connectionClosed: boolean
  private _client: WS | null

  /**
   * @param url Full url of websocket: e.g. https://pleroma.io/api/v1/streaming
   * @param stream Stream name, please refer: https://git.pleroma.social/pleroma/pleroma/blob/develop/lib/pleroma/web/mastodon_api/mastodon_socket.ex#L19-28
   * @param accessToken The access token.
   * @param userAgent The specified User Agent.
   */
  constructor(url: string, stream: string, accessToken: string, userAgent: string) {
    super()
    this.url = url
    this.stream = stream
    this.parser = new Parser()
    this.headers = {
      'User-Agent': userAgent
    }
    this._accessToken = accessToken
    this._reconnectInterval = 1000
    this._reconnectMaxAttempts = Infinity
    this._reconnectCurrentAttempts = 0
    this._connectionClosed = false
    this._client = null
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
    this._client = this._connect(this.url, this.stream, this._accessToken, this.headers)
    this._bindSocket(this._client)
  }

  /**
   * Stop current connection.
   */
  public stop() {
    this._resetConnection()
    this._resetRetryParams()
  }

  /**
   * Clean up current connection, and listeners.
   */
  private _resetConnection() {
    if (this._client) {
      this._client.removeAllListeners()
      this._client.close(1000)
      this._client = null
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
  private _reconnect() {
    if (this._client) {
      setTimeout(() => {
        if (this._reconnectCurrentAttempts < this._reconnectMaxAttempts) {
          this._reconnectCurrentAttempts++
          // Call connect methods
          console.log('Reconnecting')
          this._client = this._connect(this.url, this.stream, this._accessToken, this.headers)
          this._bindSocket(this._client)
        }
      }, this._reconnectInterval)
    }
  }

  /**
   * @param url Base url of streaming endpoint.
   * @param stream The specified stream name.
   * @param accessToken Access token.
   * @param headers The specified headers.
   * @return A WebSocket instance.
   */
  private _connect(url: string, stream: string, accessToken: string, headers: { [key: string]: string }): WS {
    const params: Array<string> = [`stream=${stream}`]

    if (accessToken !== null) {
      params.push(`access_token=${accessToken}`)
    }
    const requestURL: string = `${url}/?${params.join('&')}`
    const options: WS.ClientOptions = {
      headers: headers
    }

    const cli: WS = new WS(requestURL, options)
    return cli
  }

  /**
   * Bind event for web socket client.
   * @param client A WebSocket instance.
   */
  private _bindSocket(client: WS) {
    client.on('close', (code: number, _reason: string) => {
      // Refer the code: https://tools.ietf.org/html/rfc6455#section-7.4
      if (code === 1000) {
        this.emit('close', {})
      } else {
        console.log(`Closed connection with ${code}`)
        // If already called close method, it does not retry.
        if (!this._connectionClosed) {
          this._reconnect()
        }
      }
    })
    client.on('open', () => {
      this.emit('connect', {})
    })
    client.on('message', (data: WS.Data) => {
      this.parser.parse(data)
    })
    client.on('error', (err: Error) => {
      this.emit('error', err)
    })
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
export class Parser extends EventEmitter {
  /**
   * @param message Message body of websocket.
   */
  public parse(message: WS.Data) {
    if (typeof message !== 'string') {
      this.emit('heartbeat', {})
      return
    }

    if (message === '') {
      this.emit('heartbeat', {})
      return
    }

    let event = ''
    let payload = ''
    let mes = {}
    try {
      const obj = JSON.parse(message)
      event = obj.event
      payload = obj.payload
      mes = JSON.parse(payload)
    } catch (err) {
      // delete event does not have json object
      if (event !== 'delete') {
        this.emit('error', new Error(`Error parsing websocket reply: ${message}, error message: ${err}`))
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
        this.emit('error', new Error(`Unknown event has received: ${message}`))
    }
  }
}
