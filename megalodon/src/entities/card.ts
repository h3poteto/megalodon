namespace Entity {
  export type Card = {
    url: string
    title: string
    description: string
    type: 'link' | 'photo' | 'video' | 'rich'
    image: string | null
    author_name: string | null
    author_url: string | null
    provider_name: string | null
    provider_url: string | null
    html: string | null
    width: number | null
    height: number | null
    embed_url: string | null
    blurhash: string | null
  }
}
