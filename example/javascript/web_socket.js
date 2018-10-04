const Mastodon = require('../../lib/mastodon')

const BASE_URL = 'https://pleroma.io'

const access_token = '...'

const client = new Mastodon(
  access_token,
  BASE_URL + '/api/v1'
)

const stream = client.socket(
  '/streaming',
  'user'
)
stream.on('connect', event => {
  console.log('connect')
})

stream.on('update', (status) => {
  console.log(status)
})

stream.on('notification', (notification) => {
  console.log(notification)
})

stream.on('delete', (id) => {
  console.log(id)
})

stream.on('error', (err) => {
  console.error(err)
})

stream.on('heartbeat', (msg) => {
  console.log('thump.')
})

stream.on('close', () => {
  console.log('close')
})

stream.on('parser-error', (err) => {
  console.error(err)
})
