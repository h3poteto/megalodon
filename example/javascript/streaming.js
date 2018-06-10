const Mastodon = require( '../../lib/mastodon')

const BASE_URL = 'https://friends.nico'

const access_token = '...'

const client = new Mastodon(
  access_token,
  BASE_URL + '/api/v1'
)

const stream = client.stream('/streaming/public')
stream.on('message', (data) => {
  console.log(data)
})

stream.on('error', (err) => {
  console.error(err)
})

stream.on('heartbeat', (msg) => {
  console.log('thump.')
})

