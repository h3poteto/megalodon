namespace PleromaEntity {
  export type Card = {
    url: string
    title: string
    description: string
    image: string | null
    type: 'link' | 'photo' | 'video' | 'rich'
    author_name: string | null
    author_url: string | null
    provider_name: string | null
    provider_url: string | null
    html: string | null
    width: number | null
    height: number | null
  }
}
