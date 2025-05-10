import generator, { Entity, Response } from 'megalodon'

declare var process: {
  env: {
    PLEROMA_ACCESS_TOKEN: string
  }
}

const BASE_URL: string = 'https://pleroma.io'

const access_token: string = process.env.PLEROMA_ACCESS_TOKEN

const client = generator('pleroma', BASE_URL, access_token)

client.subscribeAccount('3').then((res: Response<Entity.Relationship>) => {
  console.log(res.data)
})
