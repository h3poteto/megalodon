import Mastodon, { Status, Response } from 'megalodon'

const BASE_URL: string = 'https://mstdn.jp'

const access_token: string = '...'

const client = new Mastodon(
  access_token,
  BASE_URL + '/api/v1'
)

client.get<[Status]>('/favourites')
  .then((res: Response<[Status]>) => {
    console.log(res.headers)
    console.log(res.data)
  })
