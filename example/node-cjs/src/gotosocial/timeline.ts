import generator, { MegalodonInterface, Entity, Response } from 'megalodon'

const BASE_URL: string = process.env.GOTOSOCIAL_URL!

const access_token: string = process.env.GOTOSOCIAL_ACCESS_TOKEN!

const client: MegalodonInterface = generator('gotosocial', BASE_URL, access_token)

client.getPublicTimeline().then((resp: Response<Array<Entity.Status>>) => {
  console.log(resp.data)
})
