import generator, { Entity, Response } from 'megalodon'

const BASE_URL = process.env.FRIENDICA_URL!

const client = generator('friendica', BASE_URL)

client
  .getInstance()
  .then((res: Response<Entity.Instance>) => {
    console.log(res.data)
  })
  .catch(err => console.error(err))
