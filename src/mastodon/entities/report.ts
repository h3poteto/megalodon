namespace MastodonEntity {
  export type Report = {
    id: string
    action_taken: string
    comment: string
    account_id: string
    status_ids: Array<string>
  }
}
