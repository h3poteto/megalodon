import { Account } from './account'

export type Reaction = {
  count: number
  me: boolean
  name: string
  accounts?: Array<Account>
}
