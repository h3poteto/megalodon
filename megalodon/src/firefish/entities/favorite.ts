import { Note } from './note.js'

export type Favorite = {
  id: string
  createdAt: string
  noteId: string
  note: Note
}
