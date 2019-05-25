import Account from './account'
import Application from './application'
import Mention from './mention'
import Tag from './tag'
import Attachment from './attachment'
import Emoji from './emoji'
import Card from './card'

export default interface Status {
  id: string
  uri: string
  url: string
  account: Account
  in_reply_to_id: number | null
  in_reply_to_account_id: number | null
  reblog: Status | null
  content: string
  created_at: string
  emojis: Emoji[]
  replies_count: number
  reblogs_count: number
  favourites_count: number
  reblogged: boolean | null
  favourited: boolean | null
  muted: boolean | null
  sensitive: boolean
  spoiler_text: string
  visibility: 'public' | 'unlisted' | 'private' | 'direct'
  media_attachments: Attachment[]
  mentions: Mention[]
  tags: Tag[]
  card: Card | null
  application: Application
  language: string | null
  pinned: boolean | null
}
