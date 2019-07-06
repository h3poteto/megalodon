import Mastodon, { Status, Notification, WebSocket } from 'megalodon'

declare var process: {
  env: {
    PLEROMA_HOST: string
    PLEROMA_ACCESS_TOKEN: string
  }
}

const BASE_URL: string = process.env.PLEROMA_HOST

const access_token: string = process.env.PLEROMA_ACCESS_TOKEN

const client = new Mastodon(access_token, BASE_URL + '/api/v1')

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
