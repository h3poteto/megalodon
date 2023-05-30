/// <reference path="history.ts" />

namespace MastodonEntity {
  export type Tag = {
    name: string
    url: string
    history: Array<History>
    following?: boolean
  }
}
