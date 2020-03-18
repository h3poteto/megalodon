import generator from 'megalodon'

declare var process: {
  env: {
    MISSKEY_ACCESS_TOKEN: string
  }
}

const BASE_URL: string = 'https://misskey.io'

const access_token: string = process.env.MISSKEY_ACCESS_TOKEN

const client = generator('misskey', BASE_URL, access_token)

client.getRelationships(['7rl99pkppb', '7rkr4nmz19']).then(res => {
  console.log(res.data)
})
