import generator, { MegalodonInterface, Entity, Response } from 'megalodon'

declare var process: {
  env: {
    MISSKEY_ACCESS_TOKEN: string
  }
}

const BASE_URL: string = 'https://misskey.io'

const access_token: string = process.env.MISSKEY_ACCESS_TOKEN

const client: MegalodonInterface = generator('misskey', BASE_URL, access_token)

client
  .getHomeTimeline()
  .then((resp: Response<Array<Entity.Status>>) => {
    console.log(resp.data)
  })
  .catch(err => console.error(err))
