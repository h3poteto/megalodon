import { StatusParams } from './status_params.js'
import { Attachment } from './attachment.js'

export type ScheduledStatus = {
  id: string
  scheduled_at: string
  params: StatusParams
  media_attachments: Array<Attachment> | null
}
