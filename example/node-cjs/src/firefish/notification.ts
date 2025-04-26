import generator, { NotificationType } from 'megalodon'

const BASE_URL: string = process.env.FIREFISH_URL!
const access_token: string = process.env.FIREFISH_ACCESS_TOKEN!

const client = generator('firefish', BASE_URL, access_token)

client.getNotifications({ exclude_types: [NotificationType.Favourite, NotificationType.Reblog] }).then(res => console.log(res.data))
