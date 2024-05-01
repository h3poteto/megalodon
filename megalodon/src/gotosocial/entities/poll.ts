import { Emoji } from './emoji'

export type Poll = {
  id: string
  expires_at: string | null
  expired: boolean
  multiple: boolean
  votes_count: number
  options: Array<PollOption>
  voted: boolean
  emojis: Array<Emoji>
}

export type PollOption = {
  title: string
  votes_count: number | null
}
