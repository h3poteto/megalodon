import { History } from './history.js'

export type Tag = {
  name: string
  url: string
  history: Array<History>
  following?: boolean
}
