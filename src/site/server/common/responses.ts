import { Request, Response } from 'express'
import { GFError } from 'good-flow'
import { isGFError } from 'good-flow/lib/good-flow/error'

import { isExhError } from '../../../common/exhError'
import { ExhError } from '../../../common/exhError/types'
import { STATUS_CODES } from '../../../common/exhError/statusCodes'
import { ExhResponse } from '../../common/responses'
import { SerializedExhError } from '../../../common/exhError/serialization/types'
import { ErrorType } from '../../../common/errorTypes'
import { MimeType } from '../../../common/mimeType'
import { ExhEnv, getEnv } from '../../../common/env'

export type AnyRequest = Request<any, any, any>
export type AnyResponse = Response<any>

const env = getEnv()

const setContentTypeHeader = (res: Response, type: MimeType) => {
  res.setHeader('Content-Type', type)
}

const serializeError = (error: GFError | ExhError | Error): SerializedExhError => {
  if (isExhError(error))
    return error.serialize()

  // Shim in GFError for now. We will remove all of the ExhError stuff soon.
  if (isGFError(error)) {
    const serializedError = error.serialize()
    return {
      message: serializedError.msg,
      type: ErrorType.SERVER_ERROR,
    }
  }

  return {
    message: 'An unexpected error occured.',
    causedBy: error.message,
    stack: error.stack,
  }
}

export const sendErrorResponse = (
  res: AnyResponse,
  error: GFError | ExhError | Error,
) => {
  const serializedExhError = serializeError(error)

  // TODO: This is not elegant. Could be better?
  if (env !== ExhEnv.DEV)
    delete serializedExhError.stack

  const response: ExhResponse = serializedExhError
  setContentTypeHeader(res, 'application/json')
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
