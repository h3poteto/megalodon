export default interface Filter {
  id: number
  phrase: string
  context: Array<string>
  expires_at: string | null
  irreversible: boolean
  whole_word: boolean
}
