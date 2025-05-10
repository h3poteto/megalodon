import generator, { Entity, Response } from 'megalodon'

declare var process: {
  env: {
    PLEROMA_ACCESS_TOKEN: string
  }
}

const BASE_URL: string = 'https://pleroma.io'

const access_token: string = process.env.PLEROMA_ACCESS_TOKEN

const client = generator('pleroma', BASE_URL, access_token)

client.getMarkers(['home', 'notifications']).then((res: Response<Entity.Marker | Record<never, never>>) => {
  console.log(res.data)
})

// client
//   .saveMarkers({ home: { last_read_id: 'A88wHq4Mwbg8vUOvo0' }, notifications: { last_read_id: '7056' } })
//   .then((res: Response<Entity.Marker>) => {
//     console.log(res.data)
//   })
