/**
 * simple authorizaion tool via command line
 */

const readline = require('readline')
const Mastodon = require( '../lib/mastodon')

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
})

const SCOPES = 'read write follow'
const BASE_URL = 'https://friends.nico'

let clientId
let clientSecret

Mastodon.registerApp('Test App', {
  scopes: SCOPES
}, BASE_URL).then(appData => {
  clientId = appData.clientId
  clientSecret = appData.clientSecret
  console.log('Authorization URL is generated.')
  console.log(appData.url)
  console.log()
  return new Promise(resolve => {
    rl.question('Enter the authorization code from website: ', code => {
      resolve(code)
      rl.close()
    })
  })
}).then(code => Mastodon.fetchAccessToken(clientId, clientSecret, code, BASE_URL))
  .then(tokenData => {
    console.log('\naccess_token:')
    console.log(tokenData.accessToken)
    console.log()
  })
  .catch(err => console.error(err))

