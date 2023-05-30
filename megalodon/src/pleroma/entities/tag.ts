/// <reference path="history.ts" />

namespace PleromaEntity {
  export type Tag = {
    name: string
    url: string
    history: Array<History>
    following?: boolean
  }
}
