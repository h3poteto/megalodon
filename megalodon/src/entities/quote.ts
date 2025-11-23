import { Status } from './status'

export type ShallowQuote = {
  state: QuoteState
  quoted_status_id: string | null
}

export type QuoteState =
  | 'pending'
  | 'accepted'
  | 'rejected'
  | 'revoked'
  | 'deleted'
  | 'unauthorized'
  | 'blocked_account'
  | 'blocked_domain'
  | 'muted_account'

export type Quote = {
  state: QuoteState
  quoted_status: Status | null
}

export type QuotedStatus = ShallowQuote | Quote
