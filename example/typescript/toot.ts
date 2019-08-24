import * as readline from 'readline'
import Mastodon, { Status, Response } from 'megalodon'

const rl: readline.ReadLine = readline.createInterface({
  input: process.stdin,
  output: process.stdout
})

const BASE_URL: string = 'https://pleroma.io'

const access_token: string = process.env.PLEROMA_ACCESS_TOKEN as string

const client = new Mastodon(access_token, BASE_URL + '/api/v1')
new Promise(resolve => {
  rl.question('Toot: ', status => {
    client
      .post<Status>('/statuses', {
        status: status
      })
      .then((res: Response<Status>) => {
        console.log(res)
        rl.close()
        resolve(res)
      })
      .catch(err => {
        console.error(err)
        rl.close()
      })
  })
})
