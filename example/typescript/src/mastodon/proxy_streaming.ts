import generator, { Entity, StreamListenerInterface, ProxyConfig } from 'megalodon'

declare var process: {
  env: {
    MASTODON_ACCESS_TOKEN: string
    PROXY_HOST: string
    PROXY_PORT: number
    PROXY_PROTOCOL: 'http' | 'https' | 'socks4' | 'socks4a' | 'socks5' | 'socks5h' | 'socks'
  }
}

const BASE_URL: string = 'https://fedibird.com'

const access_token: string = process.env.MASTODON_ACCESS_TOKEN

const proxy: ProxyConfig = {
  host: process.env.PROXY_HOST,
  port: process.env.PROXY_PORT,
  protocol: process.env.PROXY_PROTOCOL
}

const client = generator('mastodon', BASE_URL, access_token, null, proxy)

const stream: StreamListenerInterface = client.userStream()
stream.on('connect', _ => {
  console.log('connect')
})

stream.on('not-event-stream', (mes: string) => {
  console.log(mes)
})

stream.on('update', (status: Entity.Status) => {
  console.log(status)
})

stream.on('notification', (notification: Entity.Notification) => {
  console.log(notification)
})

stream.on('delete', (id: number) => {
  console.log(id)
})

stream.on('error', (err: Error) => {
  console.error(err)
})

stream.on('heartbeat', () => {
  console.log('thump.')
})

stream.on('connection-limit-exceeded', (err: Error) => {
  console.error(err)
})
