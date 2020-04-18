/// <reference path="status.ts" />

namespace PleromaEntity {
  export type Context = {
    ancestors: Array<Status>
    descendants: Array<Status>
  }
}
