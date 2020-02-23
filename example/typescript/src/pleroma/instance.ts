import generator, { Entity, Response } from 'megalodon'

const BASE_URL: string = 'http://pleroma.io'

const client = generator('pleroma', BASE_URL)

client.getInstance().then((res: Response<Entity.Instance>) => {
  console.log(res)
})
