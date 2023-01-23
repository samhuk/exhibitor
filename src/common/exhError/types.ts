import { ErrorType } from '../errorTypes'
import { ExhString } from '../exhString/types'
import { SerializedExhError } from './serialization/types'

export type ExhError<TData extends any = any> = {
  message: ExhString
  causedBy?: ExhString
  advice?: ExhString
  inner?: ExhError | Error
  data?: TData
  stack?: string
  type?: ErrorType
  /**
   * @default undefined
   */
  serialize: (dataSerializer?: 'json' | ((data: TData) => any)) => SerializedExhError
  log: () => void
}

export type ExhErrorOptions<TData extends any = any> = {
  message: ExhString
  causedBy?: ExhString
  advice?: ExhString
  inner?: ExhError | Error
  data?: TData
  /**
   * @default ErrorType.SERVER_ERROR
   */
  type?: ErrorType
  /**
   * Determines whether the error is logged when it's created. Otherwise, it can be logged
   * later or set as the inner error of another error.
   * @default false
   */
  log?: boolean
}
