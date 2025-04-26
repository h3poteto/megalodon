import generator, { isCancel } from 'megalodon'

const url: string = process.env.FIREFISH_URL!
const access_token: string = process.env.FIREFISH_ACCESS_TOKEN!
const client = generator('firefish', url, access_token)

client
  .search('h3poteto', { type: 'accounts' })
  .then(res => console.log(res.data))
  .catch(err => {
    if (isCancel(err)) {
      console.log('Request was canceled')
    }
  })

setTimeout(() => {
  client.cancel()
}, 1000)
