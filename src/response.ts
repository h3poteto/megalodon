export default interface Response<T = any> {
  data: T,
  status: number,
  statusText: string,
  headers: any
}
