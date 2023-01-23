import { Request, Response } from 'express'
import * as fs from 'fs'
import { createExhError, isExhError } from '../../../common/exhError'
import { ExhError } from '../../../common/exhError/types'
import { sendErrorResponse, sendSuccessResponse } from '../common/responses'

const getExhibitCode = (req: Request): string | ExhError => {
  const exhibitSrcPath = req.query.exhibitSrcPath as string
  try {
    return fs.readFileSync(exhibitSrcPath, { encoding: 'utf8' })
  }
  catch (e: any) {
    return createExhError({
      message: c => `Could not read the component exhibit source file at '${c.cyan(exhibitSrcPath)}`,
      causedBy: e,
    })
  }
}

export const handleGetExhibitCode = (req: Request, res: Response) => {
  const result = getExhibitCode(req)
  if (isExhError(result))
    sendErrorResponse(res, result)
  else
    sendSuccessResponse(res, result, { contentType: 'text/plain' })
}
