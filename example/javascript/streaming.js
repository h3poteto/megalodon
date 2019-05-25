const Mastodon = require('../../lib/mastodon')

const BASE_URL = 'https://mstdn.jp'

const access_token = process.env.MASTODON_ACCESS_TOKEN

const client = new Mastodon(access_token, BASE_URL + '/api/v1')

const stream = client.stream('/streaming/public')
stream.on('connect', event => {
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
