import generator, { isCancel } from 'megalodon'

const access_token: string = process.env.MISSKEY_ACCESS_TOKEN!
const client = generator('misskey', 'https://misskey.io', access_token)

client
  .search('h3poteto', 'accounts')
  .then(res => console.log(res.data))
  .catch(err => {
    if (isCancel(err)) {
      console.log('Request was canceled')
    }
  })

setTimeout(() => {
  client.cancel()
}, 1000)
