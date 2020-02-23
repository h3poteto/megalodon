import generator, { MegalodonInterface, Entity, Response } from 'megalodon'

declare var process: {
  env: {
    PLEROMA_ACCESS_TOKEN: string
  }
}

const BASE_URL: string = 'https://pleroma.io'

const access_token: string = process.env.PLEROMA_ACCESS_TOKEN

const client: MegalodonInterface = generator('pleroma', BASE_URL, access_token)

client.getPublicTimeline().then((resp: Response<Array<Entity.Status>>) => {
  console.log(resp.data)
})
