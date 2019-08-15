export class RequestCanceledError extends Error {
  public isCancel: boolean

  constructor(msg: string) {
    super(msg)
    this.isCancel = true
    Object.setPrototypeOf(this, RequestCanceledError)
  }
}

export const isCancel = (value: any): boolean => {
  return value && value.isCancel
}
