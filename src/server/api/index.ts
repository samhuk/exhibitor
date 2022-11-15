import cors from 'cors'
import { json, Router } from 'express'
import { HealthcheckStatus } from '../../common/responses'
import { sendSuccessResponse } from './responses'

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

export default router
