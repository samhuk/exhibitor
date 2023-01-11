import cors from 'cors'
import { json, Router } from 'express'

import { RunE2eTestOptions } from '../../common/e2eTesting'
import { handleGetExhibitCode } from './exhibitCode'
import { handleGetHealthCheck } from './healthCheck'
import { handleGetMetaData } from './metaData'
import { sendSuccessResponse } from './responses'
import { runTests } from './testing'

const router = Router()
  .use(cors())
  .use(json())
  .use('/healthcheck', handleGetHealthCheck)
  .get('/metadata', handleGetMetaData)
  .get('/exhibitCode', handleGetExhibitCode)
  .post('/e2e-test', async (req, res) => {
    const options: RunE2eTestOptions = req.body

    const results = await runTests(options)

    sendSuccessResponse(req, res, results)
  })

export default router
