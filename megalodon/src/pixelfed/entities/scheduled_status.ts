import { Attachment } from './attachment.js'
import { StatusParams } from './status_params.js'

export type ScheduledStatus = {
  id: string
  scheduled_at: string
  params: StatusParams
  media_attachments: Array<Attachment>
}
