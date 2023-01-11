import { fork } from 'child_process'
import path from 'path'
import * as fs from 'fs'
import { VARIANT_PATH_ENV_VAR_NAME } from '../../../common/testing'
import { RunE2eTestOptions } from '../../common/e2eTesting'
import { JSON_REPORTER_FILE } from '../../../common/paths'

export const runTests = async (
  options: RunE2eTestOptions,
) => new Promise((res, rej) => {
  console.log(options)

  const absTestFilePath = path.join(path.dirname(options.exhibitSrcFilePath), options.testFilePath).replace(/\\/g, '/')

  console.log('Executing playwright test:', absTestFilePath)

  // Determine where the playwright CLI js file is
  const playwrightCliJsPath = require.resolve('playwright-core/cli')

  // Tell playwright where to write the results JSON file
  process.env.PLAYWRIGHT_JSON_OUTPUT_NAME = JSON_REPORTER_FILE

  // Add on our own environment variables
  process.env[VARIANT_PATH_ENV_VAR_NAME] = options.variantPath

  // Build up playwright CLI test command arguments
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
    res(JSON.parse(fs.readFileSync(JSON_REPORTER_FILE, { encoding: 'utf8' })))
  })
})
