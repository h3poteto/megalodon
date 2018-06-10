const readline = require('readline')
const Mastodon = require('../../lib/mastodon')

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
})

const BASE_URL = 'https://friends.nico'

const access_token = '...'

const client = new Mastodon(
  access_token,
  BASE_URL + '/api/v1'
)
new Promise(resolve => {
  rl.question('Toot: ', status => {
    client.post('/statuses', {
      status: status
    })
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
