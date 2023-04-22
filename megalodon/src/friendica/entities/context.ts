/// <reference path="status.ts" />

namespace FriendicaEntity {
  export type Context = {
    ancestors: Array<Status>
    descendants: Array<Status>
  }
}
