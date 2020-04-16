import MastodonAPI from '../mastodon/api_client'
import MegalodonEntity from '../entity'
import PleromaEntity from './entity'

namespace PleromaAPI {
  export namespace Entity {
    export type Account = PleromaEntity.Account
    export type Emoji = PleromaEntity.Emoji
    export type Status = MastodonAPI.Entity.Status
    export type Relationship = MastodonAPI.Entity.Relationship
    export type Reaction = PleromaEntity.Reaction
    export type Source = PleromaEntity.Source
  }

  export namespace Converter {
    export const account = (a: Entity.Account): MegalodonEntity.Account => a
    export const status = (s: Entity.Status): MegalodonEntity.Status => s
    export const relationship = (r: Entity.Relationship): MegalodonEntity.Relationship => r
    export const reaction = (r: Entity.Reaction): MegalodonEntity.Reaction => ({
      count: r.count,
      me: r.me,
      name: r.name,
      accounts: r.accounts.map(a => account(a))
    })
  }
}

export default PleromaAPI
