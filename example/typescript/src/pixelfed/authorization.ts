import * as readline from 'readline'
import generator, { OAuth } from 'megalodon'

const rl: readline.ReadLine = readline.createInterface({
  input: process.stdin,
  output: process.stdout
})

const SCOPES: Array<string> = ['read', 'write', 'follow']
const BASE_URL: string = 'https://pixelfed.tokyo'

let clientId: string
let clientSecret: string

const client = generator('pixelfed', BASE_URL)

client
  .registerApp('Test App', {
    scopes: SCOPES
  })
  .then(appData => {
    clientId = appData.clientId
    clientSecret = appData.clientSecret
    console.log('Authorization URL is generated.')
    console.log(appData.url)
    console.log()
    return new Promise<string>(resolve => {
      rl.question('Enter the authorization code from website: ', code => {
        resolve(code)
        rl.close()
      })
    })
  })
  .then((code: string) => {
    return client.fetchAccessToken(clientId, clientSecret, code, BASE_URL)
  })
  .then((tokenData: OAuth.TokenData) => {
    console.log('\naccess_token:')
    console.log(tokenData.accessToken)
    console.log('\nrefresh_token:')
    console.log(tokenData.refreshToken)
    console.log()
  })
  .catch((err: Error) => console.error(err))
