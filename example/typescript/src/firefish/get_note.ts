import * as readline from 'readline'
import generator, { MegalodonInterface } from 'megalodon'

const rl: readline.ReadLine = readline.createInterface({
  input: process.stdin,
  output: process.stdout
})

const BASE_URL: string = process.env.FIREFISH_URL!
const access_token: string = process.env.FIREFISH_ACCESS_TOKEN!

new Promise((resolve, reject) => {
  rl.question('NoteID: ', id => {
    const client: MegalodonInterface = generator('firefish', BASE_URL, access_token)

    client
      .getStatus(id)
      .then(res => {
        console.log(res.data)
        resolve(res)
      })
      .catch(err => {
        console.error(err)
        reject(err)
      })
  })
})
