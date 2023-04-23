/// <reference path="tag.ts" />
/// <reference path="emoji.ts" />

namespace MastodonEntity {
  export type Announcement = {
    id: string
    content: string
    starts_at: string | null
    ends_at: string | null
    published: boolean
    all_day: boolean
    published_at: string
    updated_at: string
    read?: boolean
    mentions: Array<AnnouncementAccount>
    statuses: Array<AnnouncementStatus>
    tags: Array<Tag>
    emojis: Array<Emoji>
    reactions: Array<Reaction>
  }

  export type AnnouncementAccount = {
    id: string
    username: string
    url: string
    acct: string
  }

  export type AnnouncementStatus = {
    id: string
    url: string
  }

  export type Reaction = {
    name: string
    count: number
    me?: boolean
    url?: string
    static_url?: string
  }
}
