import { Request, Response } from 'express'
import { isExhError } from '../../../common/exhError'
import { ExhError } from '../../../common/exhError/types'
import { STATUS_CODES } from '../../../common/exhError/statusCodes'
import { ExhResponse } from '../../common/responses'
import { SerializedExhError } from '../../../common/exhError/serialization/types'
import { ErrorType } from '../../../common/errorTypes'
import { MimeType } from '../../../common/mimeType'

export type AnyRequest = Request<any, any, any>
export type AnyResponse = Response<any>

export const sendErrorResponse = (
  res: AnyResponse,
  error: ExhError | Error,
) => {
  const serializedExhError: SerializedExhError = isExhError(error)
    ? error.serialize()
    : {
      message: 'An unexpected error occured.',
      causedBy: error.message,
      stack: error.stack,
    }

  const response: ExhResponse = serializedExhError

  res.status(STATUS_CODES[serializedExhError.type ?? ErrorType.SERVER_ERROR] ?? 500).send(response)
}

export const sendSuccessResponse = <TData extends any = any>(
  res: AnyResponse,
  data: TData,
  options?: { contentType: MimeType },
) => {
  if (options?.contentType != null)
    res.header('Content-Type', options?.contentType)

  const response: ExhResponse<TData> = data

  res.status(200).send(response)
}

export const sendResponse = <TData extends any = any>(
  res: AnyResponse,
  data: TData | ExhError | Error,
  options?: { contentType: MimeType },
) => {
  if (isExhError(data) || (data instanceof Error))
    sendErrorResponse(res, data)
  else
    sendSuccessResponse(res, data, options)
}
