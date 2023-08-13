namespace PleromaEntity {
  export type Card = {
    url: string
    title: string
    description: string
    type: 'link' | 'photo' | 'video' | 'rich'
    image: string | null
    provider_name: string
    provider_url: string
  }
}
