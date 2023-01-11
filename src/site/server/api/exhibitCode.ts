import { Request, Response } from 'express'
import * as fs from 'fs'
import { serverError } from './errorVariants'
import { sendErrorResponse, sendSuccessResponse } from './responses'

export const handleGetExhibitCode = (req: Request, res: Response) => {
  const exhibitSrcPath = req.query.exhibitSrcPath as string

  let exhibitCode: string
  try {
    exhibitCode = fs.readFileSync(exhibitSrcPath, { encoding: 'utf8' })
  }
  catch (e: any) {
    sendErrorResponse(req, res, serverError(`Could not read the file '${exhibitSrcPath}'.\n\nError: ${e}`))
    return
  }

  sendSuccessResponse(req, res, exhibitCode)
}
