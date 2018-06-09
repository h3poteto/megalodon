import { EventEmitter } from 'events'

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

    const size: number = chunk.length
    let start: number = 0
    let offset: number = 0
    let curr: string | undefined
    let next: string | undefined

    while (offset < size) {
      curr = chunk[offset]
      next = chunk[offset + 1]

      if (curr === '\n' && next === '\n') {
        const piece: string = chunk.slice(start, offset)

        offset += 2
        start = offset

        /* eslint-disable no-continue */
        if (!piece.length) continue // empty object

        const root: Array<string> = piece.split('\n')

        // should never happen, as long as mastodon doesn't change API messages
        if (root.length !== 2) continue

        // remove event and data markers
        const event: string = root[0].substr(7)
        let data: string = root[1].substr(6)

        try {
          data = JSON.parse(data)
        } catch (err) {
          this.emit('error', new Error(`Error parsing API reply: '${piece}', error message: '${err}'`))
        } finally {
          if (data) { // filter
            this.emit('element', { event, data })
          }
          // eslint-disable-next-line no-unsafe-finally
          continue
        }
      }
      offset++
    }
    this.message = chunk.slice(start, size)
  }
}

export default Parser
