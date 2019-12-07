import { EventEmitter } from 'events'
import axios from 'axios'
import httpAdapter from 'axios/lib/adapters/http'
import Parser from './parser'
import { Status } from './entities/status'
import { Notification } from './entities/notification'
import { Conversation } from './entities/conversation'

const STATUS_CODES_TO_ABORT_ON: Array<number> = [400, 401, 403, 404, 406, 410, 422]

class EventStreamError extends Error {
  public statusCode: number
  public message: string

  constructor(statusCode: number, message: string) {
    super()
    this.statusCode = statusCode
    this.message = message
  }
}

class EventStream extends EventEmitter {
  public url: string
  public headers: object
  public parser: Parser
  private _connectionClosed: boolean = false
  private _reconnectInterval: number
  private _reconnectMaxAttempts: number = Infinity
  private _reconnectCurrentAttempts: number = 0

  constructor(url: string, headers: object, _reconnectInterval: number) {
    super()
    this.url = url
    this.headers = headers
    this.parser = new Parser()
    this._reconnectInterval = _reconnectInterval
  }

  public start() {
    this._setupParser()
    this._connect()
  }

  private _connect() {
    axios.get(this.url, { responseType: 'stream', adapter: httpAdapter }).then(response => {
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

          const error: EventStreamError = new EventStreamError(response.status, body)
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

  private _reconnect() {
    setTimeout(() => {
      if (this._reconnectCurrentAttempts < this._reconnectMaxAttempts) {
        this._reconnectCurrentAttempts++
        console.log('Reconnecting')
        this._connect()
      }
    }, this._reconnectInterval)
  }

  public stop() {
    this._connectionClosed = true
    this._resetConnection()
    this._resetRetryParams()
  }

  private _resetConnection() {
    // TODO: close axios streaming connection

    if (this.parser) {
      this.parser.removeAllListeners()
    }
  }

  private _resetRetryParams() {
    this._reconnectCurrentAttempts = 0
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
    this.parser.on('conversation', (conversation: Conversation) => {
      this.emit('conversation', conversation)
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

export default EventStream
