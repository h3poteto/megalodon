import * as readline from 'readline'
import generator, { Entity, Response } from 'megalodon'

const rl: readline.ReadLine = readline.createInterface({
  input: process.stdin,
  output: process.stdout
})

const BASE_URL: string = 'https://misskey.io'

const access_token: string = process.env.MISSKEY_ACCESS_TOKEN as string

const client = generator('misskey', BASE_URL, access_token)

const options = {
  poll: {
    options: ['hoge', 'fuga'],
    expires_in: 86400,
    multiple: false
  }
}

new Promise(resolve => {
  rl.question('Toot: ', status => {
    client
      .postStatus(status, options)
      .then((res: Response<Entity.Status>) => {
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
