import { Note } from './note'

export type Favorite = {
  id: string
  createdAt: string
  noteId: string
  note: Note
}
