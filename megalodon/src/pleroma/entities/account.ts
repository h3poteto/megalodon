/// <reference path="emoji.ts" />
/// <reference path="source.ts" />
/// <reference path="field.ts" />
namespace PleromaEntity {
  export type Account = {
    id: string
    username: string
    acct: string
    display_name: string
    locked: boolean
    discoverable?: boolean
    noindex: boolean | null
    suspended: boolean | null
    limited: boolean | null
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
}
