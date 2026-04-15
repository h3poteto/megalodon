import generator from 'megalodon'

const BASE_URL: string = process.env.SHARKEY_URL!
const access_token: string = process.env.SHARKEY_ACCESS_TOKEN!

const client = generator('sharkey', BASE_URL, access_token)

client.getRelationships(['9h6wa44zml', '9jla6fu7d8vyj0ji']).then(res => {
  console.log(res.data)
})
