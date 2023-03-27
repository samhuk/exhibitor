import cors from 'cors'
import { json, Router } from 'express'

import { handleGetExhibitCode } from './exhibitCode'
import { handleGetHealthCheck } from './healthCheck'
import { handleGetMetaData } from './metaData'
import { sendErrorResponse, sendSuccessResponse } from '../common/responses'
import { runPlaywrightTests } from './playwrightTesting'
import { RunPlaywrightTestsOptions } from '../../common/testing/playwright'

const router = Router()
  .use(cors())
  .use(json())
  .use('/healthcheck', handleGetHealthCheck)
  .get('/metadata', handleGetMetaData)
  .get('/exhibit-code', handleGetExhibitCode)
  .post('/run-pw-tests', async (req, res) => {
    const options: RunPlaywrightTestsOptions = req.body

    const [response, err] = await runPlaywrightTests(options)

    if (err != null) {
      sendErrorResponse(res, err)
      return
    }

    sendSuccessResponse(res, response)
  })

export default router
