import generator, { Entity, Response } from 'megalodon'
import axios from 'axios'

const BASE_URL: string = process.env.MASTODON_URL!
const instance = axios.create()

const client = generator('mastodon', BASE_URL, null, null, instance)

client.getInstance().then((res: Response<Entity.Instance>) => {
  console.log(res.data)
})
