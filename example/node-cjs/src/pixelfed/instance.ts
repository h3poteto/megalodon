import generator, { Entity, Response } from 'megalodon'

const BASE_URL: string = process.env.PIXELFED_URL!

const client = generator('pixelfed', BASE_URL)

client.getInstance().then((res: Response<Entity.Instance>) => {
  console.log(res.data)
})
