export const NO_REDIRECT = 'urn:ietf:wg:oauth:2.0:oob'
export const DEFAULT_SCOPE = ['read', 'write', 'follow']
export const DEFAULT_UA = 'megalodon'

export function isBrowser() {
  if (typeof window !== 'undefined') {
    return true
  } else {
    return false
  }
}
