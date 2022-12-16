import cors from 'cors'
import { json, Router } from 'express'
import * as fs from 'fs'

import { getMetadata, MetaData } from '../../../common/metadata'
import { BUILD_OUTPUT_ROOT_DIR, META_DATA_FILE, META_DATA_FILE_NAME } from '../../../common/paths'
import { HealthcheckStatus } from '../../common/responses'
import { sendSuccessResponse } from './responses'

const startTime = new Date()
const startTimeUnixOffset = startTime.getTime()
let metaData: MetaData

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
    if (metaData == null)
      metaData = getMetadata()

    // TODO: Figure out how to do this. Not sure yet how to link an exhibit name to the file path to it's code.
  })

export default router
