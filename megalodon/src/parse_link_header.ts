// Refs: https://gist.github.com/Honkalonkalooohhhhh/dfe8a3721f77ded62ff8038ead2afd77
export function parseLinkHeader(header: string): LinkHeader {
  const links: LinkHeader = {}

  if (header.length === 0) {
    throw new Error('input must not be of zero length')
  }

  const parts = header.split(',')
  // Parse each part into a named link
  parts.forEach(part => {
    const section: string[] = part.split(';')

    if (section.length !== 2) {
      throw new Error("section could not be split on ';'")
    }
    const url = section[0].replace(/<(.*)>/, '$1').trim()
    const name = section[1].replace(/rel="(.*)"/, '$1').trim()
    links[name] = url
  })

  return links
}

export type LinkHeader = { [key: string]: string }
