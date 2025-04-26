import { Status } from './status.js'

export type Context = {
  ancestors: Array<Status>
  descendants: Array<Status>
}
