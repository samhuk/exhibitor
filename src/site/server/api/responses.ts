import { Request, Response } from 'express'
import { ErrorData, ErrorTypes, CUSTOM_ERROR_DATA_PREFIX, OutputError } from '../../common/errors'

export type AnyRequest = Request<any, any, any>
export type AnyResponse = Response<any>

const mapErrorToOutputError = (error: Error): OutputError => {
  if (error == null)
    return null

  // If error message starts with the custom error data prefix, then map custom error
  if (error.message.startsWith(CUSTOM_ERROR_DATA_PREFIX)) {
    const serializedErrorData: ErrorData = JSON.parse(error.message.substring(CUSTOM_ERROR_DATA_PREFIX.length))
    return {
      type: serializedErrorData.type,
      data: serializedErrorData.data,
      statusCode: serializedErrorData.statusCode,
      stack: error.stack.substring(error.stack.indexOf('createError') + 'createError'.length),
    }
  }

  // Else, map the standard error (will be caused by an unexpected/external exception)
  return {
    type: ErrorTypes.SERVER_ERROR,
    data: error.message,
    stack: error.stack,
    statusCode: 500,
  }
}

export const sendErrorResponse = <TData extends any = any>(req: AnyRequest, res: AnyResponse, error: Error, data?: TData) => {
  const outputError = mapErrorToOutputError(error)
  res.status(outputError.statusCode).send({ data, error: outputError })
}

export const sendSuccessResponse = <TData extends any = any>(req: AnyRequest, res: AnyResponse, data: TData) => {
  res.status(200).send({ data, error: null })
}
