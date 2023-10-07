import { User } from './user'
import { Emoji } from './emoji'
import { File } from './file'
import { Poll } from './poll'

export type Note = {
  id: string
  createdAt: string
  userId: string
  user: User
  text: string | null
  cw?: string | null
  visibility: 'public' | 'home' | 'followers' | 'specified' | 'hidden'
  renoteCount: number
  repliesCount: number
  reactions: { [key: string]: number }
  emojis?: Array<Emoji> | null
  fileIds?: Array<string>
  files?: Array<File>
  replyId?: string | null
  renoteId?: string | null
  uri?: string
  reply?: Note
  renote?: Note
  tags?: Array<string>
  poll?: Poll | null
  mentions?: Array<string>
  myReaction?: string | null
}
