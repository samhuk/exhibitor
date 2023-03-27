import { Request, Response } from 'express'
import { GFError, SerializeGFErrorOptions } from 'good-flow'
import { StatusCode } from 'status-code-enum'

import { ExhResponse } from '../../common/responses'
import { MimeType } from '../../../common/mimeType'
import { getIsDemo } from '../../../common/env'

export type AnyRequest = Request<any, any, any>
export type AnyResponse = Response<any>

const isDemo = getIsDemo()

const errorSerializeOptions: SerializeGFErrorOptions = isDemo
  // Exclude stack traces when not in dev mode
  ? {
    customStackTraceSerializer: false,
    nativeStackTraceSerializer: false,
  }
  : undefined

const setContentTypeHeader = (res: Response, type: MimeType) => {
  res.setHeader('Content-Type', type)
}

export const sendErrorResponse = (
  res: AnyResponse,
  error: GFError,
  options?: {
    status?: StatusCode
  },
) => {
  const response: ExhResponse = {
    data: undefined,
    error: error.serialize(errorSerializeOptions),
  }
  setContentTypeHeader(res, 'application/json')
  res.status(options?.status ?? StatusCode.ServerErrorInternal).send({ data: undefined, error: response })
}

export const sendSuccessResponse = <TData extends any = any>(
  res: AnyResponse,
  data: TData,
  options?: { contentType: MimeType },
) => {
  if (options?.contentType != null)
    res.header('Content-Type', options?.contentType)

  const response: ExhResponse<TData> = { data }

  res.status(200).send(response)
}
