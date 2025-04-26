import { URLs } from './urls.js'
import { Stats } from './stats.js'
import { Account } from './account.js'

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
  invites_enabled: boolean
  max_toot_chars: number
  contact_account: Account
  rules: Array<InstanceRule>
}

export type InstanceRule = {
  id: string
  text: string
}
