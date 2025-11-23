import { Account } from './account.js'
import { Application } from './application.js'
import { Emoji } from './emoji.js'
import { Attachment } from './attachment.js'
import { Mention } from './mention.js'
import { Reaction } from './reaction.js'
import { Card } from './card.js'
import { Poll } from './poll.js'
import { QuotedStatus } from './quote.js'
import { QuoteApproval } from './quote_approval.js'

export type Status = {
  id: string
  uri: string
  url?: string
  account: Account
  in_reply_to_id: string | null
  in_reply_to_account_id: string | null
  reblog: Status | null
  content: string
  plain_content: string | null
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
  card: Card | null
  poll: Poll | null
  application: Application | null
  language: string | null
  pinned: boolean | null
  emoji_reactions: Array<Reaction>
  quote: QuotedStatus | null
  quote_approval: QuoteApproval
  bookmarked: boolean
}

export type StatusTag = {
  name: string
  url: string
}

export type StatusVisibility = 'public' | 'unlisted' | 'private' | 'direct' | 'local'
