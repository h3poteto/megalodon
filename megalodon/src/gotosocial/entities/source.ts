import { Field } from './field'

export type Source = {
  privacy: string | null
  sensitive: boolean | null
  language: string | null
  note: string
  fields?: Array<Field>
}
