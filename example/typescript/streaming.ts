import Mastodon, { Status, Notification, StreamListener } from 'megalodon'

const BASE_URL: string = 'https://mastodon.social'

const access_token: string = '7112db7030fee4267acfe861bcf5b287544ea031490fd5662a6f0c99703fafd5'

const client = new Mastodon(
  access_token,
  BASE_URL + '/api/v1'
)

const stream: StreamListener = client.stream('/streaming/public')
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
