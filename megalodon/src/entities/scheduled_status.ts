import { StatusParams } from './status_params'
import { Attachment } from './attachment'

export type ScheduledStatus = {
  id: string
  scheduled_at: string
  params: StatusParams
  media_attachments: Array<Attachment> | null
}
