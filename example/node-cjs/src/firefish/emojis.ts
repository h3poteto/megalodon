import generator, { MegalodonInterface } from 'megalodon'

const BASE_URL: string = process.env.FIREFISH_URL!
const access_token: string = process.env.FIREFISH_ACCESS_TOKEN!

const client: MegalodonInterface = generator('firefish', BASE_URL, access_token)

client
  .getInstanceCustomEmojis()
  .then(res => console.log(res.data))
  .catch(err => console.error(err))
