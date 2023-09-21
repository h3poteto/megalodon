import generator, { Entity, Response } from 'megalodon'
import * as fs from 'fs'

const BASE_URL: string = process.env.FIREFISH_URL!
const access_token: string = process.env.FIREFISH_ACCESS_TOKEN!

const client = generator('firefish', BASE_URL, access_token)

const image = fs.createReadStream('test.png')

client.uploadMedia(image).then((resp: Response<Entity.Attachment | Entity.AsyncAttachment>) => {
  console.log(resp.data)
})
