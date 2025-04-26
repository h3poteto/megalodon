import generator, { MegalodonInterface, Entity, Response } from 'megalodon'

const BASE_URL: string = process.env.PIXELFED_URL!

const access_token: string = process.env.PIXELFED_ACCESS_TOKEN!

const client: MegalodonInterface = generator('pixelfed', BASE_URL, access_token)

client.getPublicTimeline().then((resp: Response<Array<Entity.Status>>) => {
  console.log(resp.data)
})
