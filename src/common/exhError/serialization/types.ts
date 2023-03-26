export type SerializedExhError = {
  message: string
  causedBy?: string
  stack?: string
  data?: any
  inner?: SerializedExhError | Error
}
