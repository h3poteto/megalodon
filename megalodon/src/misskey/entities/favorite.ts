/// <reference path="note.ts" />

namespace MisskeyEntity {
  export type Favorite = {
    id: string
    createdAt: string
    noteId: string
    note: Note
  }
}
