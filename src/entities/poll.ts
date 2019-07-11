import { PollOption } from './poll_option'

export type Poll = {
  id: string
  expires_at: string | null
  expired: boolean
  multiple: boolean
  votes_count: number
  options: PollOption
  voted: boolean
}
