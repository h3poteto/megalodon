import generator, { NotificationType } from 'megalodon'

declare var process: {
  env: {
    MISSKEY_ACCESS_TOKEN: string
  }
}

const BASE_URL: string = 'https://misskey.io'

const access_token: string = process.env.MISSKEY_ACCESS_TOKEN

const client = generator('misskey', BASE_URL, access_token)

client.getNotifications({ exclude_types: [NotificationType.Favourite, NotificationType.Reblog] }).then(res => console.log(res.data))
