namespace MisskeyEntity {
  export type Announcement = {
    id: string
    createdAt: string
    updatedAt: string | null
    text: string
    title: string
    imageurl: string | null
    isRead?: boolean
  }
}
