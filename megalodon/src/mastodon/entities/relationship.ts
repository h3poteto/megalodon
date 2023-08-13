namespace MastodonEntity {
  export type Relationship = {
    id: string
    following: boolean
    followed_by: boolean
    blocking: boolean
    blocked_by: boolean
    muting: boolean
    muting_notifications: boolean
    requested: boolean
    domain_blocking: boolean
    showing_reblogs: boolean
    endorsed: boolean
    notifying: boolean
    note: string
    languages: Array<string>
  }
}
