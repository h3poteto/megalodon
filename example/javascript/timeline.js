const Mastodon = require( '../../lib/mastodon')

const BASE_URL = 'https://mastodon.social'

const access_token = '...'

const client = new Mastodon(
  access_token,
  BASE_URL + '/api/v1'
)

client.get('/timelines/home')
  .then(res => console.log(res.data))
