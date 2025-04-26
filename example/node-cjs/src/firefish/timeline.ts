import generator, { MegalodonInterface, Entity, Response } from 'megalodon'

const BASE_URL: string = process.env.FIREFISH_URL!
const access_token: string = process.env.FIREFISH_ACCESS_TOKEN!

const client: MegalodonInterface = generator('firefish', BASE_URL, access_token)

client
  .getLocalTimeline()
  .then((resp: Response<Array<Entity.Status>>) => {
    console.log(resp.data)
  })
  .catch(err => console.error(err))
