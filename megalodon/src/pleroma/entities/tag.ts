import { History } from './history'

export type Tag = {
  name: string
  url: string
  history: Array<History>
  following?: boolean
}
