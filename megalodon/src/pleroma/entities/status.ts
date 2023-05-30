/// <reference path="account.ts" />
/// <reference path="application.ts" />
/// <reference path="mention.ts" />
/// <reference path="attachment.ts" />
/// <reference path="emoji.ts" />
/// <reference path="card.ts" />
/// <reference path="poll.ts" />
/// <reference path="reaction.ts" />

namespace PleromaEntity {
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
    media_attachments: Array<Attachment>
    mentions: Array<Mention>
    tags: Array<StatusTag>
    card: Card | null
    poll: Poll | null
    application: Application | null
    language: string | null
    pinned: boolean | null
    bookmarked?: boolean
    // Reblogged status contains only local parameter.
    pleroma: {
      content?: {
        'text/plain': string
      }
      spoiler_text?: {
        'text/plain': string
      }
      conversation_id?: number
      direct_conversation_id?: number | null
      emoji_reactions?: Array<Reaction>
      expires_at?: string
      in_reply_to_account_acct?: string
      local: boolean
      parent_visible?: boolean
      pinned_at?: string
      thread_muted?: boolean
    }
  }

  export type StatusTag = {
    name: string
    url: string
  }
}
