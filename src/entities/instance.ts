import Account from './account'
import URLs from './urls'
import Stats from './stats'

export default interface Instance {
  uri: string,
  title: string,
  description: string,
  email: string,
  version: string,
  thumbnail: string | null,
  urls: URLs,
  stats: Stats,
  languages: string[],
  contact_account: Account | null
}

