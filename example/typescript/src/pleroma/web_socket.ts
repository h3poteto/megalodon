import generator, { Entity, WebSocketInterface } from 'megalodon'
import log4js from 'log4js'

declare var process: {
  env: {
    PLEROMA_ACCESS_TOKEN: string
  }
}

const BASE_URL: string = 'wss://pleroma.io'

const access_token: string = process.env.PLEROMA_ACCESS_TOKEN

const client = generator('pleroma', BASE_URL, access_token)

const stream: WebSocketInterface = client.userSocket()

const logger = log4js.getLogger()
logger.level = 'debug'
stream.on('connect', () => {
  logger.debug('connect')
})

stream.on('pong', () => {
  logger.debug('pong')
})

stream.on('update', (status: Entity.Status) => {
  logger.debug(status.url)
})

stream.on('notification', (notification: Entity.Notification) => {
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
