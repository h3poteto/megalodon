import * as announcement from './entities/announcement.js'
import * as app from './entities/app.js'
import * as blocking from './entities/blocking.js'
import * as created_note from './entities/createdNote.js'
import * as emoji from './entities/emoji.js'
import * as favorite from './entities/favorite.js'
import * as field from './entities/field.js'
import * as file from './entities/file.js'
import * as follow from './entities/follow.js'
import * as follow_request from './entities/followRequest.js'
import * as hashtag from './entities/hashtag.js'
import * as instance from './entities/instance.js'
import * as list from './entities/list.js'
import * as meta from './entities/meta.js'
import * as mute from './entities/mute.js'
import * as note from './entities/note.js'
import * as notification from './entities/notification.js'
import * as poll from './entities/poll.js'
import * as reaction from './entities/reaction.js'
import * as relation from './entities/relation.js'
import * as session from './entities/session.js'
import * as stats from './entities/stats.js'
import * as user from './entities/user.js'
import * as user_detail from './entities/userDetail.js'

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
