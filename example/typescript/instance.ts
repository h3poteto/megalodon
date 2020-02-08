import { Mastodon, Instance, Response } from 'megalodon'

const BASE_URL: string = 'http://mastodon.social'

const client = new Mastodon(BASE_URL)

client.getInstance().then((res: Response<Instance>) => {
  console.log(res)
})
