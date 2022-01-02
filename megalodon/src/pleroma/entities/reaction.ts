/// <reference path="./account.ts" />

namespace PleromaEntity {
  export type Reaction = {
    count: number
    me: boolean
    name: string
    accounts?: Array<Account>
  }
}
