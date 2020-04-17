/// <reference path="poll_option.ts" />

namespace PleromaEntity {
  export type Poll = {
    id: string
    expires_at: string | null
    expired: boolean
    multiple: boolean
    votes_count: number
    options: Array<PollOption>
    voted: boolean
  }
}
