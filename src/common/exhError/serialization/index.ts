import { EXH_ERROR_INTERNAL_IDENTIFIER_PROP_NAME, isExhError } from '..'
import { normalizeExhString } from '../../exhString'
import { ExhError } from '../types'
import { SerializedExhError } from './types'

export const isSerializedExhError = (s: any): s is SerializedExhError => (
  s != null && typeof s === 'object' && EXH_ERROR_INTERNAL_IDENTIFIER_PROP_NAME in s
)

export const serializeExhError = (e: ExhError, dataSerializer: 'json' | ((data: any) => any)): SerializedExhError => {
  const serializedError: SerializedExhError = {
    message: normalizeExhString(e.message),
    causedBy: normalizeExhString(e.causedBy),
    stack: e.stack,
    data: dataSerializer != null
      ? typeof dataSerializer === 'string' && dataSerializer === 'json'
        ? JSON.stringify(e.data)
        : dataSerializer(e.data)
      : e.data,
    type: e.type,
    inner: e.inner != null
      ? isExhError(e.inner)
        ? serializeExhError(e.inner, dataSerializer)
        : e.inner
      : null,
  };
  (serializedError as any)[EXH_ERROR_INTERNAL_IDENTIFIER_PROP_NAME] = true
  return serializedError
}
