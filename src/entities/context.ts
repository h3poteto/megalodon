import { Status } from './status'

export type Context = {
  ancestors: Array<Status>
  descendants: Array<Status>
}
