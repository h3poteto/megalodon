import generator, { Entity, Response } from 'megalodon'

declare var process: {
  env: {
    MISSKEY_ACCESS_TOKEN: string
  }
}

const BASE_URL = 'https://misskey.io'
const access_token = process.env.MISSKEY_ACCESS_TOKEN
const client = generator('misskey', BASE_URL, access_token)
client
  .getNotifications()
  .then((res: Response<Array<Entity.Notification>>) => {
    console.log(res.headers)
    console.log(res.data)
  })
  .catch(err => console.error(err))
