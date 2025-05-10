import { Emoji } from './emoji.js'
import { Field } from './field.js'
import { Source } from './source.js'

export type Account = {
  id: string
  username: string
  acct: string
  display_name: string
  discoverable?: boolean
  locked: boolean
  followers_count: number
  following_count: number
  statuses_count: number
  note: string
  url: string
  avatar: string
  created_at: string
  avatar_static: string
  bot: boolean
  emojis: Array<Emoji>
  fields: Array<Field>
  header: string
  header_static: string
  last_status_at: string | null
  source?: Source
}
