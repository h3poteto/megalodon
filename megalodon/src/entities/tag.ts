/// <reference path="history.ts" />

namespace Entity {
  export type Tag = {
    name: string
    url: string
    history: Array<History>
    following?: boolean
  }
}
