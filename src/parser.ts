import { EventEmitter } from 'events'
import Status from './entities/status'
import Notification from './entities/notification'

/**
 * Parser
 * Parse response data in streaming.
 **/
class Parser extends EventEmitter {
  private message: string

  constructor() {
    super()
    this.message = ''
  }

  public parse(chunk: string) {
    // skip heartbeats
    if (chunk === ':thump\n') {
      this.emit('heartbeat', {})
      return
    }

    this.message += chunk
    chunk = this.message

    let chunk_split: Array<string> = chunk.split('\n\n')
    
    for (var i = 0; i < chunk_split.length - 1; i++) {
      const piece: string = chunk_split[i]
      
      if (!piece.length) continue // empty object

      const root: Array<string> = piece.split('\n')

      // should never happen, as long as mastodon doesn't change API messages
      if (root.length !== 2) continue

      // remove event and data markers
      const event: string = root[0].substr(7)
      const data: string = root[1].substr(6)

      try {
        const obj = JSON.parse(data)
        switch (event) {
          case 'update':
            this.emit('update', obj as Status)
            break
          case 'notification':
            this.emit('notification', obj as Notification)
            break
          case 'delete':
            // When delete, data is an ID of the deleted status
            this.emit('delete', obj as number)
            break
          default:
            this.emit('error', new Error(`Unknown event has received: ${event}`))
            break
        }
      } catch (err) {
        this.emit('error', new Error(`Error parsing API reply: '${piece}', error message: '${err}'`))
      } finally {
        continue
      }
    }
    this.message = chunk_split[chunk_split.length - 1]
  }
}

export default Parser
