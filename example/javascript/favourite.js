import { Mastodon } from 'megalodon'

const BASE_URL = 'https://mastodon.social'

const access_token = process.env.MASTODON_ACCESS_TOKEN

const client = new Mastodon(BASE_URL, access_token)

client.getFavourites().then(res => {
  console.log(res.headers)
  console.log(res.data)
})
