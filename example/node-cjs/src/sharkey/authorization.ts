import * as readline from 'readline'
import { OAuth, Sharkey } from 'megalodon'

const rl: readline.ReadLine = readline.createInterface({
  input: process.stdin,
  output: process.stdout
})

const BASE_URL: string = process.env.SHARKEY_URL!

let clientId: string
let clientSecret: string

const client = new Sharkey(BASE_URL)

client
  .registerApp('Test App')
  .then(appData => {
    clientId = appData.client_id
    clientSecret = appData.client_secret
    console.log('\napp_secret_key:')
    console.log('Authorization URL is generated.')
    console.log(appData.url)
    console.log()
    return new Promise<string | null>(resolve => {
      rl.question('Enter any keys after you authorize to sharkey: ', _code => {
        resolve(appData.session_token)
        rl.close()
      })
    })
  })
  .then((session_token: string | null) => {
    if (!session_token) {
      throw new Error('Could not get session token')
    }
    return client.fetchAccessToken(clientId, clientSecret, session_token)
  })
  .then((tokenData: OAuth.TokenData) => {
    console.log('\naccess_token:')
    console.log(tokenData.access_token)
    console.log('\nrefresh_token:')
    console.log(tokenData.refresh_token)
    console.log()
  })
  .catch((err: any) => {
    console.error(err)
  })
