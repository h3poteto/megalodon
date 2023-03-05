/// <reference path="account.ts" />
/// <reference path="urls.ts" />
/// <reference path="stats.ts" />

namespace MastodonEntity {
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
    registrations: boolean
    approval_required: boolean
    invites_enabled: boolean
    max_toot_chars?: number
    configuration: {
      statuses: {
        max_characters: number
        max_media_attachments: number
        characters_reserved_per_url: number
      }
      media_attachments: {
        supported_mime_types: Array<string>
        image_size_limit: number
        image_matrix_limit: number
        video_size_limit: number
        video_frame_limit: number
        video_matrix_limit: number
      }
      polls: {
        max_options: number
        max_characters_per_option: number
        min_expiration: number
        max_expiration: number
      }
    }
    contact_account: Account
    rules: Array<InstanceRule>
  }

  export type InstanceRule = {
    id: string
    text: string
  }
}
