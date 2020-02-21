/// <reference path="status.ts" />

namespace MastodonEntity {
  export type Context = {
    ancestors: Array<Status>
    descendants: Array<Status>
  }
}
