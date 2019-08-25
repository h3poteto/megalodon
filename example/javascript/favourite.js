import Mastodon from 'megalodon'

const BASE_URL = 'https://mastodon.social'

const access_token = process.env.MASTODON_ACCESS_TOKEN

const client = new Mastodon(access_token, BASE_URL + '/api/v1')

client.get('/favourites').then(res => {
  console.log(res.headers)
  console.log(res.data)
})
