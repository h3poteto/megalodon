import generator, { Entity, Response } from 'megalodon'

declare var process: {
  env: {
    PLEROMA_ACCESS_TOKEN: string
  }
}

const BASE_URL: string = 'https://pleroma.io'

const access_token: string = process.env.PLEROMA_ACCESS_TOKEN

const client = generator('pleroma', BASE_URL, access_token)

client.getFavourites().then((res: Response<Array<Entity.Status>>) => {
  console.log(res.headers)
  console.log(res.data)
})
