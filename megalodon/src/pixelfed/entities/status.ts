import { Account } from './account.js'
import { Application } from './application.js'
import { Attachment } from './attachment.js'
import { Mention } from './mention.js'
import { Emoji } from './emoji.js'
import { Poll } from './poll.js'

export type Status = {
  id: string
  uri: string
  url: string
  account: Account
  in_reply_to_id: string | null
  in_reply_to_account_id: string | null
  reblog: Status | null
  content: string
  created_at: string
  edited_at: string | null
  emojis: Emoji[]
  replies_count: number
  reblogs_count: number
  favourites_count: number
  reblogged: boolean | null
  favourited: boolean | null
  muted: boolean | null
  sensitive: boolean
  spoiler_text: string
  visibility: StatusVisibility
  media_attachments: Array<Attachment>
  mentions: Array<Mention>
  tags: Array<StatusTag>
  poll: Poll | null
  application: Application | null
  language: string | null
  bookmarked?: boolean
}

export type StatusTag = {
  name: string
  url: string
}

export type StatusVisibility = 'public' | 'unlisted' | 'private' | 'direct'
