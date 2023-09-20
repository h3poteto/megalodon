/// <reference path="note.ts" />

namespace FirefishEntity {
  export type Favorite = {
    id: string
    createdAt: string
    noteId: string
    note: Note
  }
}
