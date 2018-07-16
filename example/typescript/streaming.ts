import Mastodon from 'megalodon'

const BASE_URL: string = 'https://mastodon.social'

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

