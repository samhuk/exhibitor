import { Request, Response } from 'express'
import * as fs from 'fs'
import { MetaData } from '../../../common/metadata'
import { META_DATA_FILE } from '../../../common/paths'
import { sendSuccessResponse } from '../common/responses'

let metaData: MetaData = null

export const getMetaData = () => metaData

export const handleGetMetaData = (req: Request, res: Response) => {
  const metaDataText = fs.readFileSync(META_DATA_FILE, { encoding: 'utf8' })
  metaData = JSON.parse(metaDataText)
  sendSuccessResponse(res, metaData)
}
