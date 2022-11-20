export const CUSTOM_ERROR_DATA_PREFIX = 'CUSTOM_ERROR_DATA: '

export enum ErrorTypes {
  INVALID_REQUEST = 'INVALID_REQUEST',
  NOT_FOUND = 'NOT_FOUND',
  SERVER_ERROR = 'SERVER_ERROR',
  SERVICE_TIMEOUT = 'SERVICE_TIMEOUT',
  UNAUTHORIZED = 'UNAUTHORIZED'
}

export type OutputError<TData = any> = {
  type: string
  data: TData
  statusCode: number
  stack: string
}

export type ErrorData<TData = any> = {
  type: string
  data: TData
  statusCode: number
}
