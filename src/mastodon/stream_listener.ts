import { EventEmitter } from 'events'
import axios, { CancelTokenSource, AxiosRequestConfig } from 'axios'
import httpAdapter from 'axios/lib/adapters/http'
import { Parser } from '../parser'
import proxyAgent, { ProxyConfig } from '../proxy_config'
import Entity from './entity'
import { StreamListenerInterface } from '../megalodon'
import MastodonAPI from './api_client'

const STATUS_CODES_TO_ABORT_ON: Array<number> = [400, 401, 403, 404, 406, 410, 422]

export class StreamListenerError extends Error {
  public statusCode: number
  public message: string

  constructor(statusCode: number, message: string) {
    super()
    this.statusCode = statusCode
    this.message = message
  }
}

/**
 * EventStream
 * Listener of text/event-stream. It receives data, and parse when streaming.
 */
export default class StreamListener extends EventEmitter implements StreamListenerInterface {
  public url: string
  public headers: object
  public parser: Parser
  public proxyConfig: ProxyConfig | false = false
  private _connectionClosed: boolean = false
  private _reconnectInterval: number
  private _reconnectMaxAttempts: number = Infinity
  private _reconnectCurrentAttempts: number = 0
  private _cancelSource: CancelTokenSource

  /**
   * @param url Full url of streaming: e.g. https://mastodon.social/api/v1/streaming/user
   * @param headers headers object of streaming request
   * @param proxyConfig Proxy setting, or set false if don't use proxy
   * @param reconnectInterval reconnection interval[ms] when the connection is unexpectedly closed
   */
  constructor(url: string, headers: object, proxyConfig: ProxyConfig | false = false, reconnectInterval: number) {
    super()
    this.url = url
    this.headers = headers
    this.parser = new Parser()
    this.proxyConfig = proxyConfig
    this._reconnectInterval = reconnectInterval
    this._cancelSource = axios.CancelToken.source()
  }

  /**
   * Start streaming connection.
   */
  public start() {
    this._setupParser()
    this._connect()
  }

  /**
   * Request the url and get response, and start streaming.
   */
  private _connect() {
    let options: AxiosRequestConfig = {
      responseType: 'stream',
      adapter: httpAdapter,
      cancelToken: this._cancelSource.token
    }
    if (this.proxyConfig) {
      options = Object.assign(options, {
        httpsAgent: proxyAgent(this.proxyConfig)
      })
    }
    axios.get(this.url, options).then(response => {
      const stream = response.data
      if (response.headers['content-type'] !== 'text/event-stream') {
        this.emit('no-event-stream', 'no event')
      }

      // Response status is error
      if (STATUS_CODES_TO_ABORT_ON.includes(response.status)) {
        stream.on('data', (chunk: any) => {
          let body = chunk.toString()
          try {
            body = JSON.parse(body)
          } catch (jsonDecodeError) {
            // if non-JSON text was returned, we'll just attach it to the error as-is.
          }

          const error: StreamListenerError = new StreamListenerError(response.status, body)
          this.emit('error', error)
          this.stop()
        })
      } else {
        stream.on('data', (chunk: any) => {
          this.parser.parse(chunk.toString())
        })
        stream.on('error', (err: Error) => {
          this.emit('error', err)
        })
      }
      stream.on('end', (err: Error | undefined | null) => {
        if (err) {
          console.log(`Closed connection with ${err.message}`)
          if (!this._connectionClosed) {
            this._reconnect()
          }
        } else {
          this.emit('close', {})
        }
      })
      this.emit('connect', stream)
    })
  }

  /**
   * Reconnects to the same endpoint.
   */
  private _reconnect() {
    setTimeout(() => {
      if (this._reconnectCurrentAttempts < this._reconnectMaxAttempts) {
        this._reconnectCurrentAttempts++
        this._cancelSource.cancel()
        console.log('Reconnecting')
        this._connect()
      }
    }, this._reconnectInterval)
  }

  /**
   * Stop the connection.
   */
  public stop() {
    this._connectionClosed = true
    this._resetConnection()
    this._resetRetryParams()
  }

  /**
   * Resets connection and remove listeners.
   */
  private _resetConnection() {
    // axios does not provide stop method.
    // So we have to cancel request to stop connection.
    this._cancelSource.cancel()

    if (this.parser) {
      this.parser.removeAllListeners()
    }
  }

  /**
   * Resets parameters.
   */
  private _resetRetryParams() {
    this._reconnectCurrentAttempts = 0
  }

  /**
   * Set up parser when receive some data.
   **/
  private _setupParser() {
    this.parser.on('update', (status: Entity.Status) => {
      this.emit('update', MastodonAPI.Converter.status(status))
    })
    this.parser.on('notification', (notification: Entity.Notification) => {
      this.emit('notification', MastodonAPI.Converter.notification(notification))
    })
    this.parser.on('conversation', (conversation: Entity.Conversation) => {
      this.emit('conversation', MastodonAPI.Converter.conversation(conversation))
    })
    this.parser.on('delete', (id: string) => {
      this.emit('delete', id)
    })
    this.parser.on('error', (err: Error) => {
      this.emit('parser-error', err)
    })
    this.parser.on('connection-limit-exceeded', (err: Error) => {
      this.emit('error', err)
    })
    this.parser.on('heartbeat', _ => {
      this.emit('heartbeat', 'heartbeat')
    })
  }
}
