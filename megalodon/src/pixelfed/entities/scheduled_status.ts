import { Attachment } from './attachment'
import { StatusParams } from './status_params'

export type ScheduledStatus = {
  id: string
  scheduled_at: string
  params: StatusParams
  media_attachments: Array<Attachment>
}
