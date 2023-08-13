namespace Entity {
  export type List = {
    id: string
    title: string
    replies_policy: RepliesPolicy | null
  }

  export type RepliesPolicy = 'followed' | 'list' | 'none'
}
