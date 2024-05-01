import * as account from './entities/account'
import * as application from './entities/application'
import * as attachment from './entities/attachment'
import * as card from './entities/card'
import * as context from './entities/context'
import * as emoji from './entities/emoji'
import * as field from './entities/field'
import * as filter from './entities/filter'
import * as instance from './entities/instance'
import * as list from './entities/list'
import * as marker from './entities/marker'
import * as mentition from './entities/mention'
import * as notification from './entities/notification'
import * as poll from './entities/poll'
import * as preferences from './entities/preferences'
import * as relationship from './entities/relationship'
import * as report from './entities/report'
import * as results from './entities/results'
import * as role from './entities/role'
import * as scheduled_status from './entities/scheduled_status'
import * as source from './entities/source'
import * as stats from './entities/stats'
import * as status from './entities/status'
import * as status_params from './entities/status_params'
import * as status_source from './entities/status_source'
import * as tag from './entities/tag'
import * as token from './entities/token'
import * as urls from './entities/urls'

export namespace Entity {
  export type Account = account.Account
  export type Application = application.Application
  export type Attachment = attachment.Attachment
  export type Card = card.Card
  export type Context = context.Context
  export type Emoji = emoji.Emoji
  export type Field = field.Field
  export type Filter = filter.Filter
  export type Instance = instance.Instance
  export type List = list.List
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
  export type Role = role.Role
  export type ScheduledStatus = scheduled_status.ScheduledStatus
  export type Source = source.Source
  export type Stats = stats.Stats
  export type Status = status.Status
  export type StatusParams = status_params.StatusParams
  export type StatusSource = status_source.StatusSource
  export type Tag = tag.Tag
  export type Token = token.Token
  export type URLs = urls.URLs
}

export default Entity
