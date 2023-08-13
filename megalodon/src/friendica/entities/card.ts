namespace FriendicaEntity {
  export type Card = {
    url: string
    title: string
    description: string
    type: 'link' | 'photo' | 'video' | 'rich'
    image: string | null
    author_name: string
    author_url: string
    provider_name: string
    provider_url: string
    html: string
    width: number
    height: number
    blurhash: string | null
  }
}
