import readline from 'readline'
import { Mastodon } from 'megalodon'

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
})

const BASE_URL = 'https://mastodon.social'

const access_token = process.env.MASTODON_ACCESS_TOKEN

const client = new Mastodon(BASE_URL, access_token)
new Promise(resolve => {
  rl.question('Toot: ', status => {
    client
      .postStatus(status)
      .then(res => {
        console.log(res)
        rl.close()
      })
      .catch(err => {
        console.error(err)
        rl.close()
      })
  })
})
