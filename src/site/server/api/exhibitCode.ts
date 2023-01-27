import { Request, Response } from 'express'
import * as fs from 'fs'
import { createExhError } from '../../../common/exhError'
import { ExhError } from '../../../common/exhError/types'
import { sendResponse } from '../common/responses'

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
  sendResponse(res, result, { contentType: 'text/plain' })
}
