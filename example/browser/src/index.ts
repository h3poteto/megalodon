import generator, { Entity, Response } from 'megalodon'

const BASE_URL: string = 'https://mastodon.social'
console.log('start')

const client = generator('mastodon', BASE_URL)

client.getInstance().then((res: Response<Entity.Instance>) => {
  console.log(res)
})
