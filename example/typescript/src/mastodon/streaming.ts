import generator, { Entity, StreamListenerInterface } from 'megalodon'

declare var process: {
  env: {
    MASTODON_ACCESS_TOKEN: string
  }
}

const BASE_URL: string = 'https://fedibird.com'

const access_token: string = process.env.MASTODON_ACCESS_TOKEN

const client = generator('mastodon', BASE_URL, access_token)

const stream: StreamListenerInterface = client.userStream()
stream.on('connect', _ => {
  console.log('connect')
})

stream.on('not-event-stream', (mes: string) => {
  console.log(mes)
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

stream.on('heartbeat', () => {
  console.log('thump.')
})

stream.on('connection-limit-exceeded', (err: Error) => {
  console.error(err)
})
