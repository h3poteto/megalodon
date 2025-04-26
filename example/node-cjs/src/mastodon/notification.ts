import generator, { NotificationType } from 'megalodon'

declare var process: {
  env: {
    MASTODON_ACCESS_TOKEN: string
  }
}

const BASE_URL: string = 'https://fedibird.com'

const access_token: string = process.env.MASTODON_ACCESS_TOKEN

const client = generator('mastodon', BASE_URL, access_token)

client.getNotifications({ exclude_types: [NotificationType.Favourite, NotificationType.Reblog] }).then(res => console.log(res.data))
