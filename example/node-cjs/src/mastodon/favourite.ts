import generator, { Entity, Response } from 'megalodon'

declare var process: {
  env: {
    MASTODON_ACCESS_TOKEN: string
  }
}

const BASE_URL: string = 'https://fedibird.com'

const access_token: string = process.env.MASTODON_ACCESS_TOKEN

const client = generator('mastodon', BASE_URL, access_token)

client.getFavourites().then((res: Response<Array<Entity.Status>>) => {
  console.log(res.headers)
  console.log(res.data)
})
