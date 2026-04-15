export type File = {
  id: string
  createdAt: string
  name: string
  type: string
  md5: string
  size: number
  isSensitive: boolean
  blurhash: string | null
  properties: {
    width?: number
    height?: number
    avgColor?: string
  }
  url: string | null
  thumbnailUrl: string | null
  comment: string | null
}
