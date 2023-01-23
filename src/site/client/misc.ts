import { SerializedExhError } from '../../common/exhError/serialization/types'
import { ExhResponse } from '../common/responses'

// We have to have these here because the ones in the common directory end up importing the colors lib which is node-only
const EXH_ERROR_INTERNAL_IDENTIFIER_PROP_NAME = '__exhError'
export const isSerializedExhError = (s: any): s is SerializedExhError => (
  s != null && typeof s === 'object' && EXH_ERROR_INTERNAL_IDENTIFIER_PROP_NAME in s
)

type NormalizedExhResponse<TExhResponse extends ExhResponse> = {
  data?: Exclude<TExhResponse, SerializedExhError>
  error?: SerializedExhError
}

export const normalizeExhResponse = <TExhResponse extends ExhResponse>(response: TExhResponse): NormalizedExhResponse<TExhResponse> => {
  const isError = isSerializedExhError(response)
  return {
    data: isError ? null : response as any,
    error: isError ? response : null,
  }
}
