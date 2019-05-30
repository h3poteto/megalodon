import { Attachment } from './attachment'

export type ScheduledStatus = {
  id: string
  scheduled_at: string
  params: object
  media_attachments: Array<Attachment>
}
