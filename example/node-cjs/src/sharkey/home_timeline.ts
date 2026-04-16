import generator, { MegalodonInterface, Entity, Response } from 'megalodon'

const BASE_URL: string = process.env.SHARKEY_URL!
const access_token: string = process.env.SHARKEY_ACCESS_TOKEN!

const client: MegalodonInterface = generator('sharkey', BASE_URL, access_token)

client
  .getHomeTimeline()
  .then((resp: Response<Array<Entity.Status>>) => {
    console.log(resp.data)
  })
  .catch(err => console.error(err))
