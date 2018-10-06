import Mastodon, { Status, Notification, WebSocket } from 'megalodon'

const BASE_URL: string = 'wss://pleroma.io'

const access_token: string = '...'

const client = new Mastodon(
  access_token,
  BASE_URL + '/api/v1'
)

const stream: WebSocket = client.socket('/streaming', 'user')
stream.on('connect', () => {
  console.log('connect')
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

stream.on('close', () => {
  console.log('close')
})

stream.on('parser-error', (err: Error) => {
  console.error(err)
})

