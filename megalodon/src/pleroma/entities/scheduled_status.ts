// <reference path="attachment.ts" />

namespace PleromaEntity {
  export type ScheduledStatus = {
    id: string
    scheduled_at: string
    params: object
    media_attachments: Array<Attachment>
  }
}
