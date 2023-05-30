/// <reference path="history.ts" />

namespace FriendicaEntity {
  export type Tag = {
    name: string
    url: string
    history: Array<History>
    following?: boolean
  }
}
