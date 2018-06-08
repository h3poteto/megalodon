/**
 * @param hostname should be a hostname like 'example.com'.
 *    This parameter can also include protocol like 'https://example.com',
 * @returns are a baseURL like 'https://example.com'
 */
export function normalizeBaseUrl (hostname: string): string {
  if (/^http/.test(hostname)) {
    return hostname
  }
  return `https://${hostname}`
}

export function includes<T> (wanted: T): (sequence: Iterable<T>) => boolean {
  return sequence => {
    let result = false
    for (const element of sequence) {
      if (element === wanted) {
        result = true
        break
      }
    }
    return result
  }
}
