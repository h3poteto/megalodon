import Attachment from './attachment'

export default interface ScheduledStatus {
  id: string
  scheduled_at: string
  params: object
  media_attachments: Array<Attachment>
}
