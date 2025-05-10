import * as readline from 'readline'
import generator from 'megalodon'

const rl: readline.ReadLine = readline.createInterface({
  input: process.stdin,
  output: process.stdout
})

const BASE_URL: string = process.env.MASTODON_URL!
const access_token: string = process.env.MASTODON_ACCESS_TOKEN!

new Promise(resolve => {
  rl.question('StatusID: ', id => {
    const client = generator('mastodon', BASE_URL, access_token)
    client.getStatus(id).then(res => {
      console.log(res.data)
      rl.close()
      resolve(res)
    })
  })
})
