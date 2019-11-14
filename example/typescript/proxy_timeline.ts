import Mastodon, { Status, Response, ProxyConfig } from 'megalodon'

declare var process: {
  env: {
    MASTODON_ACCESS_TOKEN: string
    PROXY_HOST: string
    PROXY_PORT: number
    PROXY_PROTOCOL: 'http' | 'https' | 'socks4' | 'socks4a' | 'socks5' | 'socks5h' | 'socks'
  }
}

const BASE_URL: string = 'https://mastodon.social'

const access_token: string = process.env.MASTODON_ACCESS_TOKEN

const proxy: ProxyConfig = {
  host: process.env.PROXY_HOST,
  port: process.env.PROXY_PORT,
  protocol: process.env.PROXY_PROTOCOL
}

const client = new Mastodon(access_token, BASE_URL + '/api/v1', 'megalodon', proxy)

client.get<Array<Status>>('/timelines/public').then((resp: Response<Array<Status>>) => {
  console.log(resp.data)
})
