import Mastodon from '../../src/mastodon'

const BASE_URL: string = 'https://friends.nico'

const access_token: string = '...'

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

stream.on('heartbeat', () => {
  console.log('thump.')
})

