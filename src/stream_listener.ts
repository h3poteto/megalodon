import Request from 'request'
import { EventEmitter } from 'events'
import Parser from './parser'
import Status from './entities/status'
import Notification from './entities/notification'

const STATUS_CODES_TO_ABORT_ON: Array<number> = [400, 401, 403, 404, 406, 410, 422]

class StreamingError extends Error {
  public statusCode: number
  public message: string

  constructor(statusCode: number, message: string) {
    super()
    this.statusCode = statusCode
    this.message = message
  }
}


/**
 * StreamListener
 * Listener of streaming. It receives data, and parse when streaming.
 **/
class StreamListener extends EventEmitter {
  public reconnectInterval = 1000
  public url: string
  public headers: object
  public request: Request.Request | null
  public response: Request.Response | null
  public parser: Parser
  private _scheduledReconnect: NodeJS.Timer | undefined
  private _connectInterval: number
  private _usedFirstReconnect: boolean
  private _stallAbortTimeout: NodeJS.Timer | undefined


  /**
   * @param url full url of streaming: e.g. https://mastodon.social/api/v1/streaming/user
   * @param headers headers of streaming request
   * @param reconnectInterval reconnection interval[ms]
   */
  constructor(url: string, headers: object, reconnectInterval?: number) {
    super()
    this.url = url
    this.headers = headers
    if (reconnectInterval) this.reconnectInterval = reconnectInterval
    this.parser = new Parser()
    this.request = null
    this.response = null
    this._connectInterval = 0
    this._usedFirstReconnect = false
  }

  /**
   * Resets the connection.
   * - clears request, response, parser
   * - removes scheduled reconnect handle (if one was scheduled)
   * - stops the stall abort timeout handle (if one was scheduled)
   */
  private _resetConnection() {
    if (this.request) {
      // clear our reference to the `request` instance
      this.request.removeAllListeners()
      this.request.destroy()
    }

    if (this.response) {
      // clear our reference to the http.IncomingMessage instance
      this.response.removeAllListeners()
      this.response.destroy()
    }

    if (this.parser) {
      this.parser.removeAllListeners()
    }

    // ensure a scheduled reconnect does not occur (if one was scheduled)
    // this can happen if we get a close event before .stop() is called
    if (this._scheduledReconnect) {
      clearTimeout(this._scheduledReconnect)
      delete this._scheduledReconnect
    }

    // clear our stall abort timeout
    this._stopStallAbortTimeout()
  }

  /**
   * Resets the parameters used in determining the next reconnect time.
   */
  private _resetRetryParams() {
    // delay for next reconnection attempt
    this._connectInterval = 0
    // flag indicating whether we used a 0-delay reconnect
    this._usedFirstReconnect = false
  }

  private _buildRequestOption(): Request.OptionsWithUrl {
    return {
      headers: this.headers,
      gzip: true,
      encoding: null,
      url: this.url
    }
  }

  private _startPersistentConnection() {
    this._resetConnection()
    this._setupParser()
    this._resetStallAbortTimeout()

    this.request = Request.get(this._buildRequestOption())
    this.emit('connect', this.request)
    this.request.on('response', (response) => {
      // reset our reconnection attempt flag so next attempt goes through with 0 delay
      // if we get a transport-level error
      this._usedFirstReconnect = false
      // start a stall abort timeout handle
      this._resetStallAbortTimeout()
      this.response = response
      if (response.headers['content-type'] !== 'text/event-stream') {
        this.emit('not-event-stream', 'no event')
      }
      if (STATUS_CODES_TO_ABORT_ON.indexOf(response.statusCode) > -1) {
        let body: string = ''
        this.response.on('data', (chunk) => {
          body += chunk.toString()

          try {
            body = JSON.parse(body)
          } catch (jsonDecodeError) {
            // if non-JSON text was returned, we'll just attach it to the error as-is
          }

          const error: StreamingError = new StreamingError(this.response!.statusCode, body)
          this.emit('error', error)
          // stop the stream explicitly so we don't reconnect
          this.stop()
          body = ''
        })
      } else {
        this.response.on('data', (chunk) => {
          this._connectInterval = 0

          this._resetStallAbortTimeout()
          this.parser.parse(chunk.toString())
        })

        this.response.on('error', (err) => {
          // expose response errors on twit instance
          this.emit('error', err)
        })

        // connected without an error response from Dweet.io, emit `connected` event
        // this must be emitted after all its event handlers are bound
        // so the reference to `self.response` is not
        // interfered-with by the user until it is emitted
        this.emit('connected', this.response)
      }
    })
    this.request.on('close', this._onClose.bind(this))
    this.request.on('error', () => {
      this._scheduleReconnect.bind(this)
    })
    return this
  }

  /**
   * Handle when the request or response closes.
   * Schedule a reconnect
   *
   */
  private _onClose() {
    this._stopStallAbortTimeout()
    if (this._scheduledReconnect) {
      // if we already have a reconnect scheduled, don't schedule another one.
      // this race condition can happen if the http.ClientRequest
      // and http.IncomingMessage both emit `close`
      return
    }
    this._scheduleReconnect()
  }

  /**
   * Kick off the http request, and persist the connection
   */
  public start() {
    this._resetRetryParams()
    this._startPersistentConnection()
    return this
  }

  /**
   * Abort the http request, stop scheduled reconnect (if one was scheduled) and clear state
   */
  public stop() {
    // clear connection variables and timeout handles
    this._resetConnection()
    this._resetRetryParams()
    return this
  }

  /**
   * Stop and restart the stall abort timer (called when new data is received)
   *
   * If we go 90s without receiving data from dweet.io, we abort the request & reconnect.
   */
  private _resetStallAbortTimeout() {
    // stop the previous stall abort timer
    this._stopStallAbortTimeout()
    // start a new 90s timeout to trigger a close & reconnect if no data received
    this._stallAbortTimeout = setTimeout(() => {
      this._scheduleReconnect()
    }, 90000)
    return this
  }

  private _stopStallAbortTimeout() {
    if (this._stallAbortTimeout) {
      clearTimeout(this._stallAbortTimeout)
      // mark the timer as `null` so it is clear
      // via introspection that the timeout is not scheduled
      delete this._stallAbortTimeout
    }
    return this
  }

  /**
   * Computes the next time a reconnect should occur (based on the last HTTP response received)
   * and starts a timeout handle to begin reconnecting after `self._connectInterval` passes.
   */
  private _scheduleReconnect() {
    if (this.response && this.response.statusCode === 420) {
      // start with a 1 minute wait and double each attempt
      if (!this._connectInterval) {
        this._connectInterval = 60000
      } else {
        this._connectInterval *= 2
      }
    } else if (this.response && String(this.response.statusCode).charAt(0) === '5') {
      // 5xx errors
      // start with a 5s wait, double each attempt up to 320s
      if (!this._connectInterval) {
        this._connectInterval = 5000
      } else if (this._connectInterval < 320000) {
        this._connectInterval *= 2
      } else {
        this._connectInterval = 320000
      }
    } else {
      // we did not get an HTTP response from our last connection attempt.
      // DNS/TCP error, or a stall in the stream (and stall timer closed the connection)
      // eslint-disable-next-line no-lonely-if
      if (!this._usedFirstReconnect) {
        // first reconnection attempt on a valid connection should occur immediately
        this._connectInterval = 0
        this._usedFirstReconnect = true
      } else if (this._connectInterval < 16000) {
        // linearly increase delay by 250ms up to 16s
        this._connectInterval += 250
      } else {
        // cap out reconnect interval at 16s
        this._connectInterval = 16000
      }
    }

    // schedule the reconnect
    this._scheduledReconnect = setTimeout(() => {
      this._startPersistentConnection()
    }, this._connectInterval)
    this.emit('reconnect', this.request, this.response, this._connectInterval)
  }

  /**
   * Set up parser when receive some data.
   **/
  private _setupParser() {
    this.parser.on('update', (status: Status) => {
      this.emit('update', status)
    })
    this.parser.on('notification', (notification: Notification) => {
      this.emit('notification', notification)
    })
    this.parser.on('delete', (id: number) => {
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

export default StreamListener
