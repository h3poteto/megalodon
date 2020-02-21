import MastodonAPI from '../mastodon/api_client'
import MegalodonEntity from '../entity'

namespace PleromaAPI {
  export namespace Entity {
    export type Status = MastodonAPI.Entity.Status
    export type Relationship = MastodonAPI.Entity.Relationship
  }

  export namespace Converter {
    export const status = (s: Entity.Status): MegalodonEntity.Status => s
    export const relationship = (r: Entity.Relationship): MegalodonEntity.Relationship => r
  }
}

export default PleromaAPI
