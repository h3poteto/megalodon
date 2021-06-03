import generator, { Entity, Response } from 'megalodon'

declare var process: {
  env: {
    MASTODON_ACCESS_TOKEN: string
  }
}

const BASE_URL: string = 'https://fedibird.com'

const access_token: string = process.env.MASTODON_ACCESS_TOKEN

const client = generator('mastodon', BASE_URL, access_token)

client.getMarkers(['home', 'notifications']).then((res: Response<Entity.Marker | {}>) => {
  console.log(res.data)
})

client
  .saveMarkers({ home: { last_read_id: '106347765980135935' }, notifications: { last_read_id: '105917259070666683' } })
  .then((res: Response<Entity.Marker>) => {
    console.log(res.data)
  })
