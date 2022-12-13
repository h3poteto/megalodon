namespace MastodonEntity {
  export type Attachment = {
    id: string
    type: 'unknown' | 'image' | 'gifv' | 'video' | 'audio'
    url: string
    remote_url: string | null
    preview_url: string | null
    text_url: string | null
    meta: object | null
    description: string | null
    blurhash: string | null
  }
}
