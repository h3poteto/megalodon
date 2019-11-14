import Mastodon, { Status, Notification, WebSocket, ProxyConfig } from 'megalodon'
import log4js from 'log4js'

declare var process: {
  env: {
    PLEROMA_ACCESS_TOKEN: string
    MASTODON_ACCESS_TOKEN: string
    PROXY_HOST: string
    PROXY_PORT: number
    PROXY_PROTOCOL: 'http' | 'https' | 'socks4' | 'socks4a' | 'socks5' | 'socks5h' | 'socks'
  }
}

const BASE_URL: string = 'wss://pleroma.io'

const access_token: string = process.env.PLEROMA_ACCESS_TOKEN

const proxy: ProxyConfig = {
  host: process.env.PROXY_HOST,
  port: process.env.PROXY_PORT,
  protocol: process.env.PROXY_PROTOCOL
}

const client = new Mastodon(access_token, BASE_URL + '/api/v1', 'megalodon', proxy)

const stream: WebSocket = client.socket('/streaming', 'user')

const logger = log4js.getLogger()
logger.level = 'debug'
stream.on('connect', () => {
  logger.debug('connect')
})

stream.on('pong', () => {
  logger.debug('pong')
})

stream.on('update', (status: Status) => {
  logger.debug(status)
})

stream.on('notification', (notification: Notification) => {
  logger.debug(notification)
})

stream.on('delete', (id: number) => {
  logger.debug(id)
})

stream.on('error', (err: Error) => {
  console.error(err)
})

stream.on('heartbeat', () => {
  logger.debug('thump.')
})

stream.on('close', () => {
  logger.debug('close')
})

stream.on('parser-error', (err: Error) => {
  logger.error(err)
})
