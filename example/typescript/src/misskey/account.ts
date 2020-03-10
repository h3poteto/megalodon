import generator, { MegalodonInterface } from 'megalodon'

declare var process: {
  env: {
    MISSKEY_ACCESS_TOKEN: string
  }
}

const BASE_URL: string = 'https://misskey.io'

const access_token: string = process.env.MISSKEY_ACCESS_TOKEN

const client: MegalodonInterface = generator('misskey', BASE_URL, access_token)

client
  .verifyAccountCredentials()
  .then(res => console.log(res.data))
  .catch(err => console.error(err))
