import cors from 'cors'
import { json, Router } from 'express'

import { handleGetExhibitCode } from './exhibitCode'
import { handleGetHealthCheck } from './healthCheck'
import { handleGetMetaData } from './metaData'
import { handleRunPlaywrightTests } from './playwrightTesting'

const router = Router()
  .use(cors())
  .use(json())
  .use('/healthcheck', handleGetHealthCheck)
  .get('/metadata', handleGetMetaData)
  .get('/exhibit-code', handleGetExhibitCode)
  .post('/run-pw-tests', handleRunPlaywrightTests)

export default router
