import generator, { Entity } from 'megalodon'

const BASE_URL: string = process.env.MASTODON_URL!

const access_token: string = process.env.MASTODON_ACCESS_TOKEN!

const client = generator('mastodon', BASE_URL, access_token)

client.localStreaming().then(stream => {
  stream.on('connect', () => {
    console.log('connect')
  })

  stream.on('pong', () => {
    console.log('pong')
  })

  stream.on('update', (status: Entity.Status) => {
    console.log(status)
  })

  stream.on('notification', (notification: Entity.Notification) => {
    console.log(notification)
  })

  stream.on('delete', (id: number) => {
    console.log(id)
  })

  stream.on('error', (err: Error) => {
    console.error(err)
  })

  stream.on('status_update', (status: Entity.Status) => {
    console.log('updated: ', status.url)
  })

  stream.on('heartbeat', () => {
    console.log('thump.')
  })

  stream.on('close', () => {
    console.log('close')
  })

  stream.on('parser-error', (err: Error) => {
    console.error(err)
  })
})
