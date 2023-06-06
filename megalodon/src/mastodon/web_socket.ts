import WS from 'ws'
import dayjs, { Dayjs } from 'dayjs'
import { EventEmitter } from 'events'
import proxyAgent, { ProxyConfig } from '../proxy_config'
import { WebSocketInterface } from '../megalodon'
import MastodonAPI from './api_client'
import { UnknownNotificationTypeError } from '../notification'

/**
 * WebSocket
 * Pleroma is not support streaming. It is support websocket instead of streaming.
 * So this class connect to Phoenix websocket for Pleroma.
 */
export default class WebSocket extends EventEmitter implements WebSocketInterface {
  public url: string
  public stream: string
  public params: string | null
  public parser: Parser
  public headers: { [key: string]: string }
  public proxyConfig: ProxyConfig | false = false
  private _accessToken: string
  private _reconnectInterval: number
  private _reconnectMaxAttempts: number
  private _reconnectCurrentAttempts: number
  private _connectionClosed: boolean
  private _client: WS | null
  private _pongReceivedTimestamp: Dayjs
  private _heartbeatInterval: number = 60000
  private _pongWaiting: boolean = false

  /**
   * @param url Full url of websocket: e.g. https://pleroma.io/api/v1/streaming
   * @param stream Stream name, please refer: https://git.pleroma.social/pleroma/pleroma/blob/develop/lib/pleroma/web/mastodon_api/mastodon_socket.ex#L19-28
   * @param accessToken The access token.
   * @param userAgent The specified User Agent.
   * @param proxyConfig Proxy setting, or set false if don't use proxy.
   */
  constructor(
    url: string,
    stream: string,
    params: string | undefined,
    accessToken: string,
    userAgent: string,
    proxyConfig: ProxyConfig | false = false
  ) {
    super()
    this.url = url
    this.stream = stream
    if (params === undefined) {
      this.params = null
    } else {
      this.params = params
    }
    this.parser = new Parser()
    this.headers = {
      'User-Agent': userAgent
    }
    this.proxyConfig = proxyConfig
    this._accessToken = accessToken
    this._reconnectInterval = 10000
    this._reconnectMaxAttempts = Infinity
    this._reconnectCurrentAttempts = 0
    this._connectionClosed = false
    this._client = null
    this._pongReceivedTimestamp = dayjs()
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
    this._client = this._connect(this.url, this.stream, this.params, this._accessToken, this.headers, this.proxyConfig)
    this._bindSocket(this._client)
  }

  /**
   * Stop current connection.
   */
  public stop() {
    this._connectionClosed = true
    this._resetConnection()
    this._resetRetryParams()
  }

  /**
   * Clean up current connection, and listeners.
   */
  private _resetConnection() {
    if (this._client) {
      this._client.close(1000)
      this._client.removeAllListeners()
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
        this._client = this._connect(this.url, this.stream, this.params, this._accessToken, this.headers, this.proxyConfig)
        this._bindSocket(this._client)
      }
    }, this._reconnectInterval)
  }

  /**
   * @param url Base url of streaming endpoint.
   * @param stream The specified stream name.
   * @param accessToken Access token.
   * @param headers The specified headers.
   * @param proxyConfig Proxy setting, or set false if don't use proxy.
   * @return A WebSocket instance.
   */
  private _connect(
    url: string,
    stream: string,
    params: string | null,
    accessToken: string,
    headers: { [key: string]: string },
    proxyConfig: ProxyConfig | false
  ): WS {
    const parameter: Array<string> = [`stream=${stream}`]

    if (params) {
      parameter.push(params)
    }

    if (accessToken !== null) {
      parameter.push(`access_token=${accessToken}`)
    }
    const requestURL: string = `${url}/?${parameter.join('&')}`
    let options: WS.ClientOptions = {
      headers: headers
    }
    if (proxyConfig) {
      options = Object.assign(options, {
        agent: proxyAgent(proxyConfig)
      })
    }

    const cli: WS = new WS(requestURL, options)
    return cli
  }

  /**
   * Clear binding event for web socket client.
   */
  private _clearBinding() {
    if (this._client) {
      this._client.removeAllListeners('close')
      this._client.removeAllListeners('pong')
      this._client.removeAllListeners('open')
      this._client.removeAllListeners('message')
      this._client.removeAllListeners('error')
    }
  }

  /**
   * Bind event for web socket client.
   * @param client A WebSocket instance.
   */
  private _bindSocket(client: WS) {
    client.on('close', (code: number, _reason: Buffer) => {
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
    client.on('pong', () => {
      this._pongWaiting = false
      this.emit('pong', {})
      this._pongReceivedTimestamp = dayjs()
      // It is required to anonymous function since get this scope in checkAlive.
      setTimeout(() => this._checkAlive(this._pongReceivedTimestamp), this._heartbeatInterval)
    })
    client.on('open', () => {
      this.emit('connect', {})
      // Call first ping event.
      setTimeout(() => {
        client.ping('')
      }, 10000)
    })
    client.on('message', (data: WS.Data, isBinary: boolean) => {
      this.parser.parse(data, isBinary)
    })
    client.on('error', (err: Error) => {
      this.emit('error', err)
    })
  }

  /**
   * Set up parser when receive message.
   */
  private _setupParser() {
    this.parser.on('update', (status: MastodonAPI.Entity.Status) => {
      this.emit('update', MastodonAPI.Converter.status(status))
    })
    this.parser.on('notification', (notification: MastodonAPI.Entity.Notification) => {
      const n = MastodonAPI.Converter.notification(notification)
      if (n instanceof UnknownNotificationTypeError) {
        console.warn(`Unknown notification event has received: ${notification}`)
      } else {
        this.emit('notification', n)
      }
    })
    this.parser.on('delete', (id: string) => {
      this.emit('delete', id)
    })
    this.parser.on('conversation', (conversation: MastodonAPI.Entity.Conversation) => {
      this.emit('conversation', MastodonAPI.Converter.conversation(conversation))
    })
    this.parser.on('status_update', (status: MastodonAPI.Entity.Status) => {
      this.emit('status_update', MastodonAPI.Converter.status(status))
    })
    this.parser.on('error', (err: Error) => {
      this.emit('parser-error', err)
    })
    this.parser.on('heartbeat', _ => {
      this.emit('heartbeat', 'heartbeat')
    })
  }

  /**
   * Call ping and wait to pong.
   */
  private _checkAlive(timestamp: Dayjs) {
    const now: Dayjs = dayjs()
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
  public parse(data: WS.Data, isBinary: boolean) {
    const message = isBinary ? data : data.toString()
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
        this.emit('update', mes as MastodonAPI.Entity.Status)
        break
      case 'notification':
        this.emit('notification', mes as MastodonAPI.Entity.Notification)
        break
      case 'conversation':
        this.emit('conversation', mes as MastodonAPI.Entity.Conversation)
        break
      case 'delete':
        this.emit('delete', payload)
        break
      case 'status.update':
        this.emit('status_update', mes as MastodonAPI.Entity.Status)
        break
      default:
        this.emit('error', new Error(`Unknown event has received: ${message}`))
    }
  }
}
