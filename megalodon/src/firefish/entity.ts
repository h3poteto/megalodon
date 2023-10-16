import * as announcement from './entities/announcement'
import * as app from './entities/app'
import * as blocking from './entities/blocking'
import * as created_note from './entities/createdNote'
import * as emoji from './entities/emoji'
import * as favorite from './entities/favorite'
import * as field from './entities/field'
import * as file from './entities/file'
import * as follow from './entities/follow'
import * as follow_request from './entities/followRequest'
import * as hashtag from './entities/hashtag'
import * as instance from './entities/instance'
import * as list from './entities/list'
import * as meta from './entities/meta'
import * as mute from './entities/mute'
import * as note from './entities/note'
import * as notification from './entities/notification'
import * as poll from './entities/poll'
import * as reaction from './entities/reaction'
import * as relation from './entities/relation'
import * as session from './entities/session'
import * as stats from './entities/stats'
import * as user from './entities/user'
import * as user_detail from './entities/userDetail'

export namespace Entity {
  export type Announcement = announcement.Announcement
  export type App = app.App
  export type Blocking = blocking.Blocking
  export type CreatedNote = created_note.CreatedNote
  export type Emoji = emoji.Emoji
  export type Favorite = favorite.Favorite
  export type Field = field.Field
  export type File = file.File
  export type Follow = follow.Follow
  export type FollowRequest = follow_request.FollowRequest
  export type Hashtag = hashtag.Hashtag
  export type Instance = instance.Instance
  export type AccountEmoji = instance.AccountEmoji
  export type List = list.List
  export type Meta = meta.Meta
  export type Mute = mute.Mute
  export type Note = note.Note
  export type NoteVisibility = note.NoteVisibility
  export type Notification = notification.Notification
  export type NotificationType = notification.NotificationType
  export type Poll = poll.Poll
  export type Choice = poll.Choice
  export type Reaction = reaction.Reaction
  export type Relation = relation.Relation
  export type Session = session.Session
  export type Stats = stats.Stats
  export type User = user.User
  export type UserDetail = user_detail.UserDetail
  export type UserDetailMe = user_detail.UserDetailMe
}

export default Entity
