import generator, { MegalodonInterface } from 'megalodon'

declare var process: {
  env: {
    FIREFISH_ACCESS_TOKEN: string
    FIREFISH_URL: string
  }
}

const BASE_URL: string = process.env.FIREFISH_URL

const access_token: string = process.env.FIREFISH_ACCESS_TOKEN

const client: MegalodonInterface = generator('firefish', BASE_URL, access_token)

client
  .verifyAccountCredentials()
  .then(res => console.log(res.data))
  .catch(err => console.error(err))
