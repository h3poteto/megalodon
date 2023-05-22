namespace MisskeyEntity {
  export type File = {
    id: string
    createdAt: string
    name: string
    type: string
    md5: string
    size: number
    isSensitive: boolean
    properties: {
      width: number
      height: number
      avgColor: string
    }
    url: string
    thumbnailUrl: string
    comment: string
    blurhash: string
  }
}
