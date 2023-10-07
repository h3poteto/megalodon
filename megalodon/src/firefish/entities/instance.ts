import { Field } from './field'

export type URLs = {
  streaming_api: string
}

export type AccountEmoji = {
  shortcode: string
  static_url: string
  url: string
  visible_in_picker: boolean
}

export type Instance = {
  uri: string
  title: string
  short_description: string
  description: string
  email: string
  version: string
  urls: URLs
  stats: {
    user_count: number
    status_count: number
    domain_count: number
  }
  thumbnail: string | null
  languages: Array<string>
  registrations: boolean
  approval_required: boolean
  invites_enabled: boolean
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
      video_frame_rate_limit: number
      video_matrix_limit: number
    }
    polls: {
      max_options: number
      max_characters_per_option: number
      min_expiration: number
      max_expiration: number
    }
  }
  contact_account: {
    id: string
    username: string
    acct: string
    display_name: string
    locked: boolean
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
    emojis: Array<AccountEmoji>
    fields: Array<Field>
    bot: boolean
  }
}
