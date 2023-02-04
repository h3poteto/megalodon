import generator, { MegalodonInterface, Entity, Response, Converter } from '@cutls/megalodon'

declare var process: {
  env: {
    MISSKEY_ACCESS_TOKEN: string
  }
}

const BASE_URL: string = 'https://chkukfsatpl3.cutls.dev'

const access_token: string = process.env.MISSKEY_ACCESS_TOKEN || '8zrWrxUIBNQ0kWUw'

const client: MegalodonInterface = generator('misskey', BASE_URL, access_token)

client
  .getLocalTimeline()
  .then((resp: Response<Array<Entity.Status>>) => {
    console.log(resp.data.map((t) => t.emojis))
  })
  .catch(err => console.error(err))
