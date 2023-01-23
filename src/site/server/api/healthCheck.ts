import { Request, Response } from 'express'
import { HealthcheckStatus } from '../../common/healthcheck'
import { sendSuccessResponse } from '../common/responses'

const startTime = new Date()
const startTimeUnixOffset = startTime.getTime()

export const handleGetHealthCheck = (req: Request, res: Response) => {
  const upTime = Date.now() - startTimeUnixOffset
  sendSuccessResponse<HealthcheckStatus>(res, {
    startTime: startTime.toLocaleString(),
    startTimeUnixOffset,
    upTimeMs: upTime,
    upTimeHours: upTime / 1000 / 60 / 60,
  })
}
