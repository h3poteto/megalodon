import generator, { Entity, Response, ProxyConfig } from 'megalodon'

declare var process: {
  env: {
    PLEROMA_ACCESS_TOKEN: string
    PROXY_HOST: string
    PROXY_PORT: number
    PROXY_PROTOCOL: 'http' | 'https' | 'socks4' | 'socks4a' | 'socks5' | 'socks5h' | 'socks'
  }
}

const BASE_URL: string = 'https://pleroma.io'

const access_token: string = process.env.PLEROMA_ACCESS_TOKEN

const proxy: ProxyConfig = {
  host: process.env.PROXY_HOST,
  port: process.env.PROXY_PORT,
  protocol: process.env.PROXY_PROTOCOL
}

const client = generator('pleroma', BASE_URL, access_token, null, proxy)

client.getPublicTimeline().then((resp: Response<Array<Entity.Status>>) => {
  console.log(resp.data)
})
