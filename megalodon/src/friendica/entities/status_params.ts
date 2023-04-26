namespace FriendicaEntity {
  export type StatusParams = {
    text: string
    in_reply_to_id: string | null
    media_ids: Array<string> | null
    sensitive: boolean | null
    spoiler_text: string | null
    visibility: 'public' | 'unlisted' | 'private' | null
    scheduled_at: string | null
    application_id: string
  }
}
