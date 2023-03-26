import { logError } from '../logging'
import { serializeExhError } from './serialization'
import { ExhError, ExhErrorOptions } from './types'

export const EXH_ERROR_INTERNAL_IDENTIFIER_PROP_NAME = '__exhError'

export const isExhError = (s: any): s is ExhError => (
  s != null && typeof s === 'object' && EXH_ERROR_INTERNAL_IDENTIFIER_PROP_NAME in s
)

export const createExhError = (options: ExhErrorOptions): ExhError => {
  const error: ExhError = {
    message: options.message,
    causedBy: options.causedBy,
    advice: options.advice,
    data: options.data,
    inner: options.inner,
    serialize: dataSerializer => serializeExhError(error, dataSerializer),
    log: () => logError(error),
  }
  Error.captureStackTrace(error);
  (error as any)[EXH_ERROR_INTERNAL_IDENTIFIER_PROP_NAME] = true
  return error
}
