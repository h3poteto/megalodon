import generator, { Response, Entity, isCancel } from 'megalodon'

const BASE_URL: string = 'https://pleroma.io'

const access_token: string = process.env.PLEROMA_ACCESS_TOKEN!

const client = generator('pleroma', BASE_URL, access_token)

client
  .search('whalebird', { resolve: true })
  .then((resp: Response<Entity.Results>) => {
    console.log(resp.data.hashtags)
  })
  .catch((err: Error) => {
    if (isCancel(err)) {
      console.log('Request was canceled')
    }
  })

setTimeout(() => {
  client.cancel()
}, 5000)
