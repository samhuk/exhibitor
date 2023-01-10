import { fork } from 'child_process'
import cors from 'cors'
import { json, Router } from 'express'
import * as fs from 'fs'
import path from 'path'

import { META_DATA_FILE } from '../../../common/paths'
import { RunE2eTestOptions } from '../../common/e2eTesting'
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
  .post('/e2e-test', (req, res) => {
    const options: RunE2eTestOptions = req.body

    console.log(options)

    const absTestFilePath = path.join(path.dirname(options.exhibitSrcFilePath), options.testFilePath).replace(/\\/g, '/')

    console.log('Executing playwright test:', absTestFilePath)

    // Determine where the playwright CLI js file is
    const playwrightCliJsPath = require.resolve('playwright-core/cli')

    const JSON_REPORTER_FILE = './.exh/playwright/results.json'

    // Tell playwright where to write the results JSON file
    process.env.PLAYWRIGHT_JSON_OUTPUT_NAME = JSON_REPORTER_FILE

    // Build playwright test options
    const args = ['test', absTestFilePath, '--reporter=json']
    if (options.headed)
      args.push('--headed')

    // Run playwright test
    const testProcess = fork(playwrightCliJsPath, args, { silent: true })

    testProcess.stdout.on('data', data => {
      console.log(String(data))
    })

    testProcess.stderr.on('data', data => {
      console.error(String(data))
    })

    testProcess.on('exit', (code, signal) => {
      sendSuccessResponse(req, res, JSON.parse(fs.readFileSync(JSON_REPORTER_FILE, { encoding: 'utf8' })))
    })
  })

export default router
