namespace Entity {
  export type Relationship = {
    id: string
    following: boolean
    followed_by: boolean
    blocking: boolean
    muting: boolean
    muting_notifications: boolean
    requested: boolean
    domain_blocking: boolean
    showing_reblogs: boolean
    endorsed: boolean
  }
}
