import Mastodon, { Status, Response } from 'megalodon'

const BASE_URL: string = 'https://mastodon.social'

const access_token: string = '...'

const client = new Mastodon(access_token, BASE_URL + '/api/v1')

client.get<Array<Status>>('/timelines/home').then((resp: Response<Array<Status>>) => {
  console.log(resp.data)
})
