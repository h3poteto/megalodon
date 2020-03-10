import generator, { Entity, Response } from 'megalodon'

const BASE_URL = 'https://misskey.io'

const client = generator('misskey', BASE_URL)

client
  .getInstance()
  .then((res: Response<Entity.Instance>) => {
    console.log(res)
  })
  .catch(err => console.error(err))
