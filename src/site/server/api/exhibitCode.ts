import { Request, Response } from 'express'
import * as fs from 'fs'
import { createGFError, GFError, GFResult } from 'good-flow'
import path from 'path'
import { sendErrorResponse, sendSuccessResponse } from '../common/responses'
import { getMetaData } from './metaData'

const createError = (inner: GFError, attemptedExhibitSrcPath: string): GFError => createGFError({
  msg: c => `Could not get the component exhibit source code for ${c.cyan(attemptedExhibitSrcPath)}.`,
  inner,
})

const getExhibitCode = (req: Request): GFResult<string> => {
  const exhibitSrcPath = req.query.exhibitSrcPath as string

  const includedFilePaths = getMetaData()?.includedFilePaths ?? []

  if (includedFilePaths.indexOf(exhibitSrcPath) === -1)
    return [undefined, createError(createGFError('Path was not an included exhibit source file.'), exhibitSrcPath)]

  const _exhibitSrcPath = process.env.EXH_DEMO === 'true' ? path.join('/mnt', exhibitSrcPath) : exhibitSrcPath
  try {
    return [fs.readFileSync(_exhibitSrcPath, { encoding: 'utf8' })]
  }
  catch (e: any) {
    return [undefined, createError(createGFError({
      msg: 'Could not read the component exhibit source file.',
      inner: e,
    }), exhibitSrcPath)]
  }
}

export const handleGetExhibitCode = (req: Request, res: Response) => {
  const [exhibitCode, err] = getExhibitCode(req)
  if (err != null)
    sendErrorResponse(res, err)
  else
    sendSuccessResponse(res, exhibitCode, { contentType: 'text/plain' })
}
