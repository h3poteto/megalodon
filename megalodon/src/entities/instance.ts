import { Account } from './account'
import { URLs } from './urls'
import { Stats } from './stats'

export type Instance = {
  uri: string
  title: string
  description: string
  email: string
  version: string
  thumbnail: string | null
  urls: URLs | null
  stats: Stats
  languages: Array<string>
  registrations: boolean
  approval_required: boolean
  invites_enabled?: boolean
  configuration: {
    statuses: {
      max_characters: number
      max_media_attachments?: number
      characters_reserved_per_url?: number
    }
    polls?: {
      max_options: number
      max_characters_per_option: number
      min_expiration: number
      max_expiration: number
    }
  }
  contact_account?: Account
  rules?: Array<InstanceRule>
}

export type InstanceRule = {
  id: string
  text: string
}
