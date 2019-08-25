import readline from 'readline'
import Mastodon from 'megalodon'

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
})

const SCOPES = 'read write follow'
const BASE_URL = 'https://mastodon.social'

let clientId
let clientSecret

Mastodon.registerApp(
  'Test App',
  {
    scopes: SCOPES
  },
  BASE_URL
)
  .then(appData => {
    clientId = appData.clientId
    clientSecret = appData.clientSecret
    console.log('\nclient_id:')
    console.log(clientId)
    console.log('\nclient_secret:')
    console.log(clientSecret)
    console.log('\nAuthorization URL is generated.')
    console.log(appData.url)
    console.log()
    return new Promise(resolve => {
      rl.question('Enter the authorization code from website: ', code => {
        resolve(code)
        rl.close()
      })
    })
  })
  .then(code => Mastodon.fetchAccessToken(clientId, clientSecret, code, BASE_URL))
  .then(tokenData => {
    console.log('\naccess_token:')
    console.log(tokenData.accessToken)
    console.log('\nrefresh_token:')
    console.log(tokenData.refreshToken)
    console.log()
  })
  .catch(err => console.error(err))
