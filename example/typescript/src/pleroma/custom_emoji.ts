import * as readline from 'readline'
import generator, { Entity, Response } from 'megalodon'

declare var process: {
  env: {
    PLEROMA_ACCESS_TOKEN: string
  }
  stdin: any
  stdout: any
}

const rl: readline.ReadLine = readline.createInterface({
  input: process.stdin,
  output: process.stdout
})

const BASE_URL: string = 'https://pleroma.io'

const access_token: string = process.env.PLEROMA_ACCESS_TOKEN

const client = generator('pleroma', BASE_URL, access_token)

rl.question(`Enter status id of ${BASE_URL}: `, id => {
  client.createEmojiReaction(id, 'arch_linux').then((res: Response<Entity.Status>) => {
    console.log(res.data)
    rl.close()
  })
})
