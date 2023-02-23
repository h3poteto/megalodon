/// <reference path="account.ts" />

namespace Entity {
  export type Reaction = {
    count: number
    me: boolean
    name: string
    accounts?: Array<Account>
    url: string
    static_url: string
  }
}
