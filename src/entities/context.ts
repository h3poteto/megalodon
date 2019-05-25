import Status from './status'

export default interface Context {
  ancestors: Array<Status>
  descendants: Array<Status>
}
