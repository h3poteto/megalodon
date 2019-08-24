import Mastodon, { Instance } from 'megalodon'

const BASE_URL: string = 'http://mastodon.social'

Mastodon.get<Instance>('/api/v1/instance', {}, BASE_URL).then(res => {
  console.log(res)
})
