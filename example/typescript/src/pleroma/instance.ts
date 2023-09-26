import generator, { Entity, Response } from 'megalodon'

const BASE_URL: string = process.env.PLEROMA_URL!

const client = generator('pleroma', BASE_URL)

client.getInstance().then((res: Response<Entity.Instance>) => {
  console.log(res.data)
})
