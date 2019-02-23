export default interface Filter {
  id: number,
  phrase: string,
  context: string[],
  expires_at: string | null,
  irreversible: boolean,
  whole_word: boolean
}
