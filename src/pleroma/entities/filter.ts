namespace PleromaEntity {
  export type Filter = {
    id: string
    phrase: string
    context: Array<string>
    expires_at: string | null
    irreversible: boolean
    whole_word: boolean
  }
}
