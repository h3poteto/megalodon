/// <reference path="account.ts" />
/// <reference path="urls.ts" />
/// <reference path="stats.ts" />

namespace PleromaEntity {
  export type Instance = {
    uri: string
    title: string
    description: string
    email: string
    version: string
    thumbnail: string | null
    urls: URLs
    stats: Stats
    languages: Array<string>
    contact_account: Account | null
    max_toot_chars?: number
    registrations?: boolean
  }
}
