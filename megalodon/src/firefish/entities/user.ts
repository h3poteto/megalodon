import { Emoji } from './emoji'

export type User = {
  id: string
  name: string | null
  username: string
  host: string | null
  avatarUrl: string | null
  avatarBlurhash: string | null
  avatarColor: string | null
  isAdmin?: boolean
  isModerator?: boolean
  isBot?: boolean
  isCat?: boolean
  isIndexable?: boolean
  speakAsCat?: boolean
  emojis: Array<Emoji>
}
