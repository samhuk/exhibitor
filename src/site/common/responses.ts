import { SerializedExhError } from '../../common/exhError/serialization/types'

export type ExhResponse<TData = any> = SerializedExhError | TData
