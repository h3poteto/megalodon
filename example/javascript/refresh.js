// Please use this function after authorization.js
// Now mastodon and pleroma don't have refersh token method.
// So this example is failed.
import Mastodon from 'megalodon'

const BASE_URL = 'https://pleroma.io'

const clientId = ''
const clientSecret = ''
const refreshToken = ''

Mastodon.refreshToken(clientId, clientSecret, refreshToken, BASE_URL)
  .then(tokenData => {
    console.log('\naccess_token:')
    console.log(tokenData.accessToken)
    console.log('\nrefresh_token:')
    console.log(tokenData.refreshToken)
    console.log()
  })
  .catch(err => console.error(err))
