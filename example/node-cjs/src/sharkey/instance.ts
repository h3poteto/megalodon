import generator, { Entity, Response } from 'megalodon'

const BASE_URL = process.env.SHARKEY_URL!

const client = generator('sharkey', BASE_URL)

client
  .getInstance()
  .then((res: Response<Entity.Instance>) => {
    console.log(res.data)
  })
  .catch(err => console.error(err))
