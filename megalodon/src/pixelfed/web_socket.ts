import { EventEmitter } from 'events'
import { WebSocketInterface } from '../megalodon'

/**
 * Streaming
 * Connect WebSocket streaming endpoint.
 */
export default class Streaming extends EventEmitter implements WebSocketInterface {
  constructor() {
    super()
  }

  /**
   * Start websocket connection.
   */
  public start() {}

  /**
   * Stop current connection.
   */
  public stop() {}
}
