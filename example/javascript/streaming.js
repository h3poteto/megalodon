import { Mastodon } from 'megalodon'

const BASE_URL = 'https://mastodon.social'

const access_token = process.env.MASTODON_ACCESS_TOKEN

const client = new Mastodon(BASE_URL, access_token)

const stream = client.publicStream()
stream.on('connect', _ => {
  console.log('connect')
})

stream.on('not-event-stream', mes => {
  console.log(mes)
})

stream.on('update', status => {
  console.log(status)
})

stream.on('notification', notification => {
  console.log(notification)
})

stream.on('delete', id => {
  console.log(`delete: ${id}`)
})

stream.on('error', err => {
  console.error(err)
})

stream.on('heartbeat', msg => {
  console.log('thump.')
})

stream.on('connection-limit-exceeded', err => {
  console.error(err)
})
