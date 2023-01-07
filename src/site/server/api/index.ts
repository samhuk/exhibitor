import cors from 'cors'
import { json, Router } from 'express'
import * as fs from 'fs'

import { META_DATA_FILE } from '../../../common/paths'
import { HealthcheckStatus } from '../../common/responses'
import { serverError } from './errorVariants'
import { sendErrorResponse, sendSuccessResponse } from './responses'

const startTime = new Date()
const startTimeUnixOffset = startTime.getTime()

const router = Router()
  .use(cors())
  .use(json())
  .use('/healthcheck', (req, res) => {
    const upTime = Date.now() - startTimeUnixOffset
    const status: HealthcheckStatus = {
      startTime: startTime.toLocaleString(),
      startTimeUnixOffset,
      upTimeMs: upTime,
      upTimeHours: upTime / 1000 / 60 / 60,
    }
    sendSuccessResponse(req, res, status)
  })
  .get('/metadata', (req, res) => {
    sendSuccessResponse(req, res, JSON.parse(fs.readFileSync(META_DATA_FILE, { encoding: 'utf8' })))
  })
  .get('/exhibitCode', (req, res) => {
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
  })

export default router
