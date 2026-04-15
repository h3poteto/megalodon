import generator, { Entity } from 'megalodon'
import log4js from 'log4js'

const BASE_URL: string = process.env.SHARKEY_URL!
const access_token: string = process.env.SHARKEY_ACCESS_TOKEN!

const client = generator('sharkey', BASE_URL, access_token)

client.publicStreaming().then(stream => {
  const logger = log4js.getLogger()
  logger.level = 'debug'
  stream.on('connect', () => {
    logger.debug('connect')
  })

  stream.on('pong', () => {
    logger.debug('pong')
  })

  stream.on('update', (status: Entity.Status) => {
    logger.debug(status)
  })

  stream.on('notification', (notification: Entity.Notification) => {
    logger.debug(notification)
  })

  stream.on('error', (err: Error) => {
    console.error(err)
  })

  stream.on('close', () => {
    logger.debug('close')
  })

  stream.on('parser-error', (err: Error) => {
    console.error(err)
  })
})
