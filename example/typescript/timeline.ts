import Mastodon from '../../src/mastodon'

const BASE_URL: string = 'https://friends.nico'

const access_token: string = '...'

const client = new Mastodon(
  access_token,
  BASE_URL + '/api/v1'
)

client.get('/timelines/home')
  .then(resp => console.log(resp))
