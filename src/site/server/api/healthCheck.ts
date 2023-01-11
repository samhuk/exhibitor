import { Request, Response } from 'express'
import { HealthcheckStatus } from '../../common/responses'
import { sendSuccessResponse } from './responses'

const startTime = new Date()
const startTimeUnixOffset = startTime.getTime()

export const handleGetHealthCheck = (req: Request, res: Response) => {
  const upTime = Date.now() - startTimeUnixOffset
  const status: HealthcheckStatus = {
    startTime: startTime.toLocaleString(),
    startTimeUnixOffset,
    upTimeMs: upTime,
    upTimeHours: upTime / 1000 / 60 / 60,
  }
  sendSuccessResponse(req, res, status)
}
