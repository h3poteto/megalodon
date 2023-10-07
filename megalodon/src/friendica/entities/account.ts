import { Emoji } from './emoji'
import { Field } from './field'
import { Source } from './source'

export type Account = {
  id: string
  username: string
  acct: string
  display_name: string
  locked: boolean
  discoverable?: boolean
  group: boolean | null
  created_at: string
  followers_count: number
  following_count: number
  statuses_count: number
  note: string
  url: string
  avatar: string
  avatar_static: string
  header: string
  header_static: string
  emojis: Array<Emoji>
  moved: Account | null
  fields: Array<Field>
  bot: boolean
  source?: Source
}
