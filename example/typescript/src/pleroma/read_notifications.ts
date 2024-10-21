import * as readline from 'readline'
import generator, { Entity, Response } from 'megalodon'

const rl: readline.ReadLine = readline.createInterface({
  input: process.stdin,
  output: process.stdout
})

const BASE_URL: string = 'https://pleroma.io'

const access_token: string = process.env.PLEROMA_ACCESS_TOKEN as string

const client = generator('pleroma', BASE_URL, access_token)

new Promise(resolve => {
  rl.question('Max notification ID: ', max_id => {
    client
      .readNotifications({ max_id: max_id })
      .then(res => {
        console.log(res)
        rl.close()
        client.getMarkers(['home', 'notifications']).then((res: Response<Entity.Marker | Record<never, never>>) => {
          console.log(res.data)
        })

        resolve(res)
      })
      .catch(err => {
        console.error(err)
        rl.close()
      })
  })
})
