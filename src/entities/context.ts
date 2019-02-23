import Status from './status'

export default interface Context {
  ancestors: Status[],
  descendants: Status[]
}
