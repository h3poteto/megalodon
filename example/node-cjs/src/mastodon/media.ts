import generator, { Entity, Response } from 'megalodon'
import * as fs from 'fs'

const BASE_URL: string = 'https://fedibird.com'

const access_token: string = process.env.MASTODON_ACCESS_TOKEN as string

const client = generator('mastodon', BASE_URL, access_token)

const image = fs.createReadStream('test.png')

client.uploadMedia(image).then((resp: Response<Entity.Attachment | Entity.AsyncAttachment>) => {
  console.log(resp.data)
})
