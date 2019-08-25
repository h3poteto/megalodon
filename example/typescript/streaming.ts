import Mastodon, { Status, Notification, StreamListener } from 'megalodon'

declare var process: {
  env: {
    MASTODON_ACCESS_TOKEN: string
  }
}

const BASE_URL: string = 'https://mastodon.social'

const access_token: string = process.env.MASTODON_ACCESS_TOKEN

const client = new Mastodon(access_token, BASE_URL + '/api/v1')

const stream: StreamListener = client.stream('/streaming/public')
stream.on('connect', _ => {
  console.log('connect')
})

stream.on('not-event-stream', (mes: string) => {
  console.log(mes)
})

stream.on('update', (status: Status) => {
  console.log(status)
})

stream.on('notification', (notification: Notification) => {
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
