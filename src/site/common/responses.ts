import { SerializedGFError } from 'good-flow/lib/serialized'

export type ExhResponse<TData = any> = { data: TData | undefined, error?: SerializedGFError }
