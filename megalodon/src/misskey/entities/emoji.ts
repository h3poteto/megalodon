namespace MisskeyEntity {
  export type Emoji = {
    name: string
    host: string | null
    url: string
    aliases: Array<string>
  }
  export type EmojiKeyValue = {
    [key: string]: string
  }
}
