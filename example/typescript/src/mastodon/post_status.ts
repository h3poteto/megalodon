import * as readline from 'readline'
import generator, { Entity, Response } from 'megalodon'

const rl: readline.ReadLine = readline.createInterface({
  input: process.stdin,
  output: process.stdout
})

const BASE_URL: string = process.env.MASTODON_URL as string

const access_token: string = process.env.MASTODON_ACCESS_TOKEN as string

const client = generator('mastodon', BASE_URL, access_token)

new Promise(resolve => {
  rl.question('Toot: ', status => {
    client
      .postStatus(status)
      .then((res: Response<Entity.Status | Entity.ScheduledStatus>) => {
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
