export default interface Attachment {
  id: number,
  type: string,
  url: string,
  remote_url: string,
  preview_url: string,
  text_url: string,
  meta: object,
  description: string
}
