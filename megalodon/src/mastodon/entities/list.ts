namespace MastodonEntity {
  export type List = {
    id: string
    title: string
    replies_policy: RepliesPolicy
  }

  export type RepliesPolicy = 'followed' | 'list' | 'none'
}
