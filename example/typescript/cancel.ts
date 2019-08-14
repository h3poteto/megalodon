import Mastodon, { Response, Results, isCancel } from 'megalodon'

const BASE_URL: string = 'https://pleroma.io'

const access_token: string = process.env.PLEROMA_ACCESS_TOKEN!

const client = new Mastodon(access_token, BASE_URL + '/api/v2')

client
  .get<Results>('/search', {
    q: 'whalebird',
    resolve: true
  })
  .then((resp: Response<Results>) => {
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
