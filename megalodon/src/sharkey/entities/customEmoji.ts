export type CustomEmoji = {
  name: string
  category: string | null
  url: string
}

export type CustomEmojiResponse = {
  emojis: Array<CustomEmoji>
}
