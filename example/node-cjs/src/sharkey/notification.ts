import generator, { NotificationType } from 'megalodon'

const BASE_URL: string = process.env.SHARKEY_URL!
const access_token: string = process.env.SHARKEY_ACCESS_TOKEN!

const client = generator('sharkey', BASE_URL, access_token)

client.getNotifications({ exclude_types: [NotificationType.Favourite, NotificationType.Reblog] }).then(res => console.log(res.data))
