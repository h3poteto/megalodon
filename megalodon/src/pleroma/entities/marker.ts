namespace PleromaEntity {
  export type Marker = {
    notifications: {
      last_read_id: string
      version: number
      updated_at: string
      pleroma: {
        unread_count: number
      }
    }
  }
}
