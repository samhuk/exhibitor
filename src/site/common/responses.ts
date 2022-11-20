import { OutputError } from './errors'

export type ResponseBase<TData = any, TErrorData = any> = {
  error: OutputError<TErrorData>
  data: TData
}

export type HealthcheckStatus = {
  startTime: string
  startTimeUnixOffset: number
  upTimeMs: number
  upTimeHours: number
}
