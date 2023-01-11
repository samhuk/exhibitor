import { Request, Response } from 'express'
import * as fs from 'fs'
import { META_DATA_FILE } from '../../../common/paths'
import { sendSuccessResponse } from './responses'

export const handleGetMetaData = (req: Request, res: Response) => {
  sendSuccessResponse(req, res, JSON.parse(fs.readFileSync(META_DATA_FILE, { encoding: 'utf8' })))
}
