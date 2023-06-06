/// <reference path="account.ts" />

namespace Entity {
  export type Reaction = {
    count: number
    me: boolean
    name: string
    accounts?: Array<Account>
    domain?: string
    static_url?: string
    url?: string
    width?: number
    height?: number
  }
}
