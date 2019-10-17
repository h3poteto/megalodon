import Mastodon, { Status, Notification, WebSocket } from 'megalodon'
import log4js from 'log4js'

declare var process: {
  env: {
    PLEROMA_ACCESS_TOKEN: string
    MASTODON_ACCESS_TOKEN: string
  }
}

const BASE_URL: string = 'wss://pleroma.io'

const access_token: string = process.env.PLEROMA_ACCESS_TOKEN

const client = new Mastodon(access_token, BASE_URL + '/api/v1')

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
