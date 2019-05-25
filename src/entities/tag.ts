import History from './history'

export default interface Tag {
  name: string
  url: string
  history: Array<History> | null
}
