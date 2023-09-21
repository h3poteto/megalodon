import generator, { Entity, Response } from 'megalodon'

const BASE_URL = process.env.FIREFISH_URL!
const access_token = process.env.FIREFISH_ACCESS_TOKEN!
const client = generator('firefish', BASE_URL, access_token)
client
  .getNotifications()
  .then((res: Response<Array<Entity.Notification>>) => {
    console.log(res.headers)
    console.log(res.data)
  })
  .catch(err => console.error(err))
