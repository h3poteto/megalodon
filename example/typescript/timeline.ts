import { Mastodon, Status, Response } from 'megalodon'

declare var process: {
  env: {
    MASTODON_ACCESS_TOKEN: string
  }
}

const BASE_URL: string = 'https://mastodon.social'

const access_token: string = process.env.MASTODON_ACCESS_TOKEN

const client = new Mastodon(BASE_URL, access_token)

client.getPublicTimeline().then((resp: Response<Array<Status>>) => {
  console.log(resp.data)
})
