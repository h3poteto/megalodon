namespace Entity {
  export type Card = {
    url: string
    title: string
    description: string
    type: 'link' | 'photo' | 'video' | 'rich'
    image?: string
    author_name?: string
    author_url?: string
    provider_name?: string
    provider_url?: string
    html?: string
    width?: number
    height?: number
  }
}
