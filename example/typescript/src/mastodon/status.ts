import generator from 'megalodon'

declare var process: {
  env: {
    MASTODON_ACCESS_TOKEN: string
  }
}

const BASE_URL: string = 'https://fedibird.com'

const access_token: string = process.env.MASTODON_ACCESS_TOKEN

const client = generator('mastodon', BASE_URL, access_token)
client.getStatus('104120282397597514').then(res => {
  console.log(res.data)
})
