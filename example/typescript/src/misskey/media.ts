import generator, { Entity, Response } from 'megalodon'
import * as fs from 'fs'

const BASE_URL: string = 'https://misskey.io'

const access_token: string = process.env.MISSKEY_ACCESS_TOKEN as string

const client = generator('misskey', BASE_URL, access_token)

const image = fs.createReadStream('test.png')

client.uploadMedia(image).then((resp: Response<Entity.Attachment>) => {
  console.log(resp.data)
})
