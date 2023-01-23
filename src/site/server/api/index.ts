import cors from 'cors'
import { json, Router } from 'express'
import { createExhError, isExhError } from '../../../common/exhError'

import { RunE2eTestOptions } from '../../common/e2eTesting'
import { handleGetExhibitCode } from './exhibitCode'
import { handleGetHealthCheck } from './healthCheck'
import { handleGetMetaData } from './metaData'
import { sendErrorResponse, sendSuccessResponse } from '../common/responses'
import { runPlaywrightTests } from './playwrightTesting'

const router = Router()
  .use(cors())
  .use(json())
  .use('/healthcheck', handleGetHealthCheck)
  .get('/metadata', handleGetMetaData)
  .get('/exhibitCode', handleGetExhibitCode)
  .post('/run-pw-tests', async (req, res) => {
    const options: RunE2eTestOptions = req.body

    const results = await runPlaywrightTests(options)

    if (results.success === true)
      sendSuccessResponse(res, results.htmlReportData, { contentType: 'text/plain' })
    else
      sendErrorResponse(res, results.error)
  })
  .get('/error-test', (req, res) => {
    try {
      throw createExhError({ message: 'Could not do the thing', causedBy: 'Because I could not do the thing' })
    }
    catch (e: any) {
      if (isExhError(e)) {
        e.log()
        res.send({
          data: null,
          error: e.serialize(),
        })
      }
    }
  })

export default router
