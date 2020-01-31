import Response from './response'
import { Application } from './entities/application'
import { Account } from './entities/account'
import { Status } from './entities/status'
import { List } from './entities/list'
import { IdentityProof } from './entities/identity_proof'
import { Relationship } from './entities/relationship'
import { Filter } from './entities/filter'
import { Report } from './entities/report'
import { FeaturedTag } from './entities/featured_tag'
import { Tag } from './entities/tag'
import { Preferences } from './entities/preferences'
import { Context } from './entities/context'
import { Attachment } from './entities/attachment'
import { Poll } from './entities/poll'
import { ScheduledStatus } from './entities/scheduled_status'
import { Conversation } from './entities/conversation'
import { Marker } from './entities/marker'
import { Notification } from './entities/notification'
import { Results } from './entities/results'
import { PushSubscription } from './entities/push_subscription'
import { Token } from './entities/token'
import StreamListener from './mastodon/stream_listener'
import WebSocket from './mastodon/web_socket'

export default interface MegalodonInterface {
  verifyAppCredentials(): Promise<Response<Application>>
  registerAccount(
    username: string,
    email: string,
    password: string,
    agreement: boolean,
    locale: string,
    reason?: string | null
  ): Promise<Response<Token>>
  verifyAccountCredentials(): Promise<Response<Account>>
  updateCredentials(
    discoverable?: string | null,
    bot?: boolean | null,
    display_name?: string | null,
    note?: string | null,
    avatar?: string | null,
    header?: string | null,
    locked?: boolean | null,
    source?: {
      privacy?: string
      sensitive?: boolean
      language?: string
    } | null,
    fields_attributes?: Array<{ name: string; value: string }>
  ): Promise<Response<Account>>
  getAccount(id: string): Promise<Response<Account>>
  getAccountStatuses(id: string): Promise<Response<Array<Status>>>
  getAccountFollowers(
    id: string,
    limit?: number | null,
    max_id?: string | null,
    since_id?: string | null
  ): Promise<Response<Array<Account>>>
  getAccountFollowing(
    id: string,
    limit?: number | null,
    max_id?: string | null,
    since_id?: string | null
  ): Promise<Response<Array<Account>>>
  getAccountLists(id: string): Promise<Response<Array<List>>>
  getIdentityProof(id: string): Promise<Response<Array<IdentityProof>>>
  followAccount(id: string, reblog: boolean): Promise<Response<Relationship>>
  unfollowAccount(id: string): Promise<Response<Relationship>>
  blockAccount(id: string): Promise<Response<Relationship>>
  unblockAccount(id: string): Promise<Response<Relationship>>
  muteAccount(id: string, notifications: boolean): Promise<Response<Relationship>>
  unmuteAccount(id: string): Promise<Response<Relationship>>
  pinAccount(id: string): Promise<Response<Relationship>>
  unpinAccount(id: string): Promise<Response<Relationship>>
  getRelationship(ids: Array<string>): Promise<Response<Relationship>>
  searchAccount(q: string, limit?: number | null, max_id?: string | null, since_id?: string | null): Promise<Response<Array<Account>>>
  getBookmarks(
    limit?: number | null,
    max_id?: string | null,
    since_id?: string | null,
    min_id?: string | null
  ): Promise<Response<Array<Status>>>
  getFavourites(limit?: number | null, max_id?: string | null, min_id?: string | null): Promise<Response<Array<Status>>>
  getMutes(limit?: number | null, max_id?: string | null, min_id?: string | null): Promise<Response<Array<Account>>>
  getBlocks(limit?: number | null, max_id?: string | null, min_id?: string | null): Promise<Response<Array<Account>>>
  getDomainBlocks(limit?: number | null, max_id?: string | null, min_id?: string | null): Promise<Response<Array<string>>>
  blockDomain(domain: string): Promise<Response<{}>>
  unblockDomain(domain: string): Promise<Response<{}>>
  getFilters(): Promise<Response<Array<Filter>>>
  getFilter(id: string): Promise<Response<Filter>>
  createFilter(
    phrase: string,
    context: Array<'home' | 'notifications' | 'public' | 'thread'>,
    irreversible?: boolean | null,
    whole_word?: boolean | null,
    expires_in?: string | null
  ): Promise<Response<Filter>>
  updateFilter(
    id: string,
    phrase: string,
    context: Array<'home' | 'notifications' | 'public' | 'thread'>,
    irreversible?: boolean | null,
    whole_word?: boolean | null,
    expires_in?: string | null
  ): Promise<Response<Filter>>
  deleteFilter(id: string): Promise<Response<Filter>>
  report(
    account_id: string,
    status_ids?: Array<string> | null,
    comment?: string | null,
    forward?: boolean | null
  ): Promise<Response<Report>>
  getFollowRequests(limit?: number): Promise<Response<Array<Account>>>
  acceptFollowRequest(id: string): Promise<Response<Relationship>>
  rejectFollowRequest(id: string): Promise<Response<Relationship>>
  getEndorsements(limit?: number | null, max_id?: string | null, since_id?: string | null): Promise<Response<Array<Account>>>
  getFeaturedTags(): Promise<Response<Array<FeaturedTag>>>
  createFeaturedTag(name: string): Promise<Response<FeaturedTag>>
  deleteFeaturedTag(id: string): Promise<Response<{}>>
  getSuggestedTags(): Promise<Response<Array<Tag>>>
  getPreferences(): Promise<Response<Preferences>>
  getSuggestions(limit?: number): Promise<Response<Array<Account>>>
  postStatus(
    status: string,
    media_ids: Array<string>,
    poll?: { options: Array<string>; expires_in: number; multiple?: boolean; hide_totals?: boolean } | null,
    in_reply_to_id?: string | null,
    sensitive?: boolean | null,
    spoiler_text?: string | null,
    visibility?: 'public' | 'unlisted' | 'private' | 'direct' | null,
    scheduled_at?: string | null,
    language?: string | null
  ): Promise<Response<Status>>
  getStatus(id: string): Promise<Response<Status>>
  deleteStatus(id: string): Promise<Response<Status>>
  getStatusContext(id: string): Promise<Response<Context>>
  getStatusRebloggedBy(id: string): Promise<Response<Array<Account>>>
  getStatusFavouritedBy(id: string): Promise<Response<Array<Account>>>
  favouriteStatus(id: string): Promise<Response<Status>>
  unfavouriteStatus(id: string): Promise<Response<Status>>
  reblogStatus(id: string): Promise<Response<Status>>
  unreblogStatus(id: string): Promise<Response<Status>>
  bookmarkStatus(id: string): Promise<Response<Status>>
  unbookmarkStatus(id: string): Promise<Response<Status>>
  muteStatus(id: string): Promise<Response<Status>>
  unmuteStatus(id: string): Promise<Response<Status>>
  pinStatus(id: string): Promise<Response<Status>>
  unpinStatus(id: string): Promise<Response<Status>>
  uploadMedia(file: any, description?: string | null, focus?: string | null): Promise<Response<Attachment>>
  updateMedia(id: string, file?: any, description?: string | null, focus?: string | null): Promise<Response<Attachment>>
  getPoll(id: string): Promise<Response<Poll>>
  votePoll(id: string, choices: Array<number>): Promise<Response<Poll>>
  getScheduledStatuses(
    limit?: number | null,
    max_id?: string | null,
    since_id?: string | null,
    min_id?: string | null
  ): Promise<Response<Array<ScheduledStatus>>>
  getScheduledStatus(id: string): Promise<Response<ScheduledStatus>>
  scheduleStatus(id: string, scheduled_at?: string | null): Promise<Response<ScheduledStatus>>
  cancelScheduledStatus(id: string): Promise<Response<{}>>
  getPublicTimeline(
    local?: boolean | null,
    only_media?: boolean | null,
    limit?: number | null,
    max_id?: string | null,
    since_id?: string | null,
    min_id?: string | null
  ): Promise<Response<Array<Status>>>
  getTagTimeline(
    hashtag: string,
    local?: boolean | null,
    only_media?: boolean | null,
    limit?: number | null,
    max_id?: string | null,
    since_id?: string | null,
    min_id?: string | null
  ): Promise<Response<Array<Status>>>
  getHomeTimeline(
    local?: boolean | null,
    limit?: number | null,
    max_id?: string | null,
    since_id?: string | null,
    min_id?: string | null
  ): Promise<Response<Array<Status>>>
  getListTimeline(
    list_id: string,
    limit?: number | null,
    max_id?: string | null,
    since_id?: string | null,
    min_id?: string | null
  ): Promise<Response<Array<Status>>>
  getConversationTimeline(
    limit?: number | null,
    max_id?: string | null,
    since_id?: string | null,
    min_id?: string | null
  ): Promise<Response<Array<Status>>>
  deleteConversation(id: string): Promise<Response<{}>>
  readConversation(id: string): Promise<Response<Conversation>>
  getLists(): Promise<Response<Array<List>>>
  getList(id: string): Promise<Response<List>>
  createList(title: string): Promise<Response<List>>
  updateList(id: string, title: string): Promise<Response<List>>
  deleteList(id: string): Promise<Response<{}>>
  getAccountsInList(id: string, limit?: number | null, max_id?: string | null, since_id?: string | null): Promise<Response<Array<Account>>>
  addAccountsToList(id: string, account_ids: Array<string>): Promise<Response<{}>>
  deleteAccountsFromList(id: string, account_ids: Array<string>): Promise<Response<{}>>
  getMarker(timeline: Array<'home' | 'notifications'>): Promise<Response<Marker | {}>>
  saveMarker(home?: { last_read_id: string } | null, notifications?: { last_read_id: string } | null): Promise<Response<Marker>>
  getNotifications(
    limit?: number | null,
    max_id?: string | null,
    since_id?: string | null,
    min_id?: string | null,
    exclude_type?: Array<'follow' | 'favourite' | 'reblog' | 'mention' | 'poll'> | null,
    account_id?: string | null
  ): Promise<Response<Array<Notification>>>
  getNotification(id: string): Promise<Response<Notification>>
  dismissNotifications(): Promise<Response<{}>>
  subscribePushNotification(
    subscription: { endpoint: string; keys: { p256dh: string; auth: string } },
    data?: { alerts: { follow?: boolean; favourite?: boolean; reblog?: boolean; mention?: boolean; poll?: boolean } } | null
  ): Promise<Response<PushSubscription>>
  getPushSubscription(): Promise<Response<PushSubscription>>
  updatePushSubscription(
    data?: { alerts: { follow?: boolean; favourite?: boolean; reblog?: boolean; mention?: boolean; poll?: boolean } } | null
  ): Promise<Response<PushSubscription>>
  deletePushSubscription(): Promise<Response<{}>>
  search(
    q: string,
    type: 'accounts' | 'hashtags' | 'statuses',
    limit?: number | null,
    max_id?: string | null,
    min_id?: string | null,
    resolve?: boolean | null,
    offset?: number | null,
    following?: boolean | null,
    account_id?: string | null,
    exclude_unreviewed?: boolean | null
  ): Promise<Response<Results>>
  userStream(): StreamListener
  publicStream(): StreamListener
  localStream(): StreamListener
  tagStream(tag: string): StreamListener
  listStream(list_id: string): StreamListener
  directStream(): StreamListener
  userSocket(): WebSocket
  publicSocket(): WebSocket
  localSocket(): WebSocket
  tagSocket(tag: string): WebSocket
  listSocket(list_id: string): WebSocket
  directSocket(): WebSocket
}
