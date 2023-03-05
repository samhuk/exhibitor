import { Request, Response } from 'express'
import * as fs from 'fs'
import path from 'path'
import { createExhError, isExhError } from '../../../common/exhError'
import { ExhError } from '../../../common/exhError/types'
import { sendErrorResponse, sendSuccessResponse } from '../common/responses'
import { getMetaData } from './metaData'

const getExhibitCode = (req: Request): string | ExhError => {
  const exhibitSrcPath = req.query.exhibitSrcPath as string

  const includedFilePaths = getMetaData()?.includedFilePaths ?? []

  if (includedFilePaths.indexOf(exhibitSrcPath) === -1) {
    return createExhError({
      message: c => `Could not read the component exhibit source file. Recieved: '${c.cyan(exhibitSrcPath)}.}`,
      causedBy: 'Path was not an included exhibit source file.',
    })
  }

  const _exhibitSrcPath = process.env.EXH_DEMO === 'true' ? path.join('/mnt', exhibitSrcPath) : exhibitSrcPath
  try {
    return fs.readFileSync(_exhibitSrcPath, { encoding: 'utf8' })
  }
  catch (e: any) {
    return createExhError({
      message: c => `Could not read the component exhibit source file. Recieved: '${c.cyan(_exhibitSrcPath)}. Attempted: ${c.cyan(path.resolve(_exhibitSrcPath))}`,
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
