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
    registrations: boolean
    approval_required: boolean
    max_toot_chars: number
    max_media_attachments?: number
    pleroma: {
      metadata: {
        account_activation_required: boolean
        birthday_min_age: number
        birthday_required: boolean
        features: Array<string>
        federation: {
          enabled: boolean
          exclusions: boolean
        }
        fields_limits: {
          max_fields: number
          max_remote_fields: number
          name_length: number
          value_length: number
        }
        post_formats: Array<string>
      }
    }
    poll_limits: {
      max_expiration: number
      min_expiration: number
      max_option_chars: number
      max_options: number
    }
  }
}
