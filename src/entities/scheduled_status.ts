import Attachment from './attachment'

export default interface ScheduledStatus {
  id: number,
  scheduled_at: string,
  params: object,
  media_attachments: Attachment[]
}
