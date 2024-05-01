export type Marker = {
  home: InnerMarker
  notifications: InnerMarker
}

type InnerMarker = {
  last_read_id: string
  version: number
  updated_at: string
}
