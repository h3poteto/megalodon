namespace MisskeyEntity {
  export type Choice = {
    text: string
    votes: number
    isVoted: boolean
  }

  export type Poll = {
    multiple: boolean
    expiresAt: string
    choices: Array<Choice>
  }
}
