import * as readline from 'readline'
import generator, { Entity, Response } from 'megalodon'

const rl: readline.ReadLine = readline.createInterface({
  input: process.stdin,
  output: process.stdout
})

const BASE_URL: string = process.env.PLEROMA_URL as string

const access_token: string = process.env.PLEROMA_ACCESS_TOKEN as string

const client = generator('pleroma', BASE_URL, access_token)

new Promise(resolve => {
  rl.question('Toot: ', status => {
    let now = new Date()
    now.setMinutes(now.getMinutes() + 6)
    client
      .postStatus(status, {
        scheduled_at: now.toISOString(),
        visibility: 'private'
      })
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
