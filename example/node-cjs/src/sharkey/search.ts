import generator, { MegalodonInterface } from 'megalodon'

const BASE_URL: string = process.env.SHARKEY_URL!
const access_token: string = process.env.SHARKEY_ACCESS_TOKEN!

const client: MegalodonInterface = generator('sharkey', BASE_URL, access_token)

client
  .search('h3poteto')
  .then(res => console.log(res.data))
  .catch(err => console.error(err))
