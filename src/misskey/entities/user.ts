namespace Entity {
  export type User = {
    id: string
    username: string
    name: string
    host: string
    description: string
    createdAt: string
    followersCount: number
    followingCount: number
    notesCount: number
    isBot: boolean
    isCat: boolean
    isAdmim: boolean
    isVerified: boolean
    isLocked: boolean
  }
}
