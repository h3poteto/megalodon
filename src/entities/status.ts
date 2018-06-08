import Account from './account'
import Application from './application'
import Mention from './mention'
import Tag from './tag'

export default interface Status {
  account: Account,
  application: Application | null,
  content: string,
  created_at: string,
  favourited: boolean | null,
  favourites_count: number,
  id: number,
  in_reply_to_account_id: number | null,
  in_reply_to_id: number | null,
  language: string | null,
  media_attachments: object[], // Attachments
  mentions: Mention[],
  muted: boolean | null,
  reblog: Status | null,
  reblogged: boolean | null,
  reblogs_count: number,
  sensitive: boolean,
  spoiler_text: string,
  tags: Tag[],
  uri: string,
  url: string,
  visibility: string
}
