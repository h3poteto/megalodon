const Mastodon = require( '../../lib/mastodon')

const BASE_URL = 'https://mstdn.jp'

const access_token = '...'

const client = new Mastodon(
  access_token,
  BASE_URL + '/api/v1'
)

client.get('/favourites')
  .then((res) => {
    console.log(res.headers)
    console.log(res.data)
  })
