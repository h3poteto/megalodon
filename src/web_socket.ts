import { client, connection, IMessage } from 'websocket'
import { EventEmitter } from 'events'
import Status from './entities/status'
import Notification from './entities/notification'

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
  }

  /**
   * Start websocket connection.
   */
  public start() {
    this._startWebSocketConnection()
  }

  /**
   * Reset connection and start new websocket connection.
   */
  private _startWebSocketConnection() {
    this._resetConnection()
    this._setupParser()
    this._getStream(this.url, this.stream, this._accessToken)
  }

  /**
   * Stop current connection.
   */
  public stop() {
    if (this._socketConnection) {
      this._socketConnection.close()
    }
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
   * Prepare websocket connection.
   * @param url Full url of websocket: e.g. https://pleroma.io/api/v1/streaming
   * @param stream Stream name, please refer: https://git.pleroma.social/pleroma/pleroma/blob/develop/lib/pleroma/web/mastodon_api/mastodon_socket.ex#L19-28
   * @param accessToken The access token.
   * @returns A Client instance of websocket.
   */
  private _getStream(url: string, stream: string, accessToken: string): client {
    const connection = new client()
    connection.on('connectFailed', (err) => {
      this.emit('error', err)
    })
    connection.on('connect', (conn) => {
      this._socketConnection = conn
      this.emit('connect', {})
      conn.on('error', (err) => {
        this.emit('error', err)
      })
      conn.on('close', () => {
        this.emit('close', {})
      })
      conn.on('message', (message: IMessage) => {
        this.parser.parser(message)
      })
    })
    const params = [`stream=${stream}`]

    if (accessToken !== null) {
      params.push(`access_token=${accessToken}`)
    }
    const req_url: string = `${url}/?${params.join('&')}`
    console.log(req_url)
    connection.connect(req_url)

    return connection
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
    this.parser.on('delete', (id: number) => {
      this.emit('delete', id)
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

    try {
      const obj = JSON.parse(data)
      const payload: string = obj.payload
      const mes = JSON.parse(payload)
      switch (obj.event) {
        case 'update':
          this.emit('update', mes as Status)
          break
        case 'notification':
          this.emit('notification', mes as Notification)
          break
        case 'delete':
          this.emit('delete', mes as number)
          break
        default:
          this.emit('error', new Error(`Unknown event has received: ${obj}`))
      }
    } catch (err) {
      this.emit('error', new Error(`Error parsing websocket reply: ${err}`))
    }
    return
  }
}
