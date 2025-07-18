import * as account from './entities/account.js'
import * as announcement from './entities/announcement.js'
import * as application from './entities/application.js'
import * as async_attachment from './entities/async_attachment.js'
import * as attachment from './entities/attachment.js'
import * as context from './entities/context.js'
import * as conversation from './entities/conversation.js'
import * as emoji from './entities/emoji.js'
import * as field from './entities/field.js'
import * as filter from './entities/filter.js'
import * as history from './entities/history.js'
import * as instance from './entities/instance.js'
import * as marker from './entities/marker.js'
import * as mentition from './entities/mention.js'
import * as notification from './entities/notification.js'
import * as poll from './entities/poll.js'
import * as preferences from './entities/preferences.js'
import * as relationship from './entities/relationship.js'
import * as report from './entities/report.js'
import * as results from './entities/results.js'
import * as scheduled_status from './entities/scheduled_status.js'
import * as source from './entities/source.js'
import * as stats from './entities/stats.js'
import * as status from './entities/status.js'
import * as status_params from './entities/status_params.js'
import * as tag from './entities/tag.js'
import * as token from './entities/token.js'

export namespace Entity {
  export type Account = account.Account
  export type Announcement = announcement.Announcement
  export type Application = application.Application
  export type AsyncAttachment = async_attachment.AsyncAttachment
  export type Attachment = attachment.Attachment
  export type Context = context.Context
  export type Conversation = conversation.Conversation
  export type Emoji = emoji.Emoji
  export type Field = field.Field
  export type Filter = filter.Filter
  export type FilterContext = filter.FilterContext
  export type History = history.History
  export type Instance = instance.Instance
  export type Marker = marker.Marker
  export type Mention = mentition.Mention
  export type Notification = notification.Notification
  export type NotificationType = notification.NotificationType
  export type Poll = poll.Poll
  export type PollOption = poll.PollOption
  export type Preferences = preferences.Preferences
  export type Relationship = relationship.Relationship
  export type Report = report.Report
  export type Results = results.Results
  export type ScheduledStatus = scheduled_status.ScheduledStatus
  export type Source = source.Source
  export type Stats = stats.Stats
  export type Status = status.Status
  export type StatusVisibility = status.StatusVisibility
  export type StatusParams = status_params.StatusParams
  export type Tag = tag.Tag
  export type Token = token.Token
}

export default Entity
