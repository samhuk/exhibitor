import { fork } from 'child_process'
import path from 'path'
import * as fs from 'fs'
import { VARIANT_PATH_ENV_VAR_NAME } from '../../../common/testing'
import { PlaywrightTestResults, RunE2eTestOptions } from '../../common/e2eTesting'
import { JSON_REPORTER_FILE } from '../../../common/paths'
import { config } from '../config'
import { Tester } from '../../../cli/config/types'

const runPlaywrightTests = (
  options: RunE2eTestOptions,
) => new Promise<PlaywrightTestResults>((res, rej) => {
  console.log('Server got this config:', config.testers)

  const absTestFilePath = path.join(path.dirname(options.exhibitSrcFilePath), options.testFilePath).replace(/\\/g, '/')

  console.log('Executing playwright test:', absTestFilePath)

  // Determine where the playwright CLI js file is
  // TODO: Check that playwright is installed. If not, then the use has done something bad:
  // They have added the "playwright tester" to exhibitor config, but not actually got the package installed.
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

export const runTests = (
  options: RunE2eTestOptions,
) => {
  if (config.testers.findIndex(tester => tester.type === Tester.PLAYWRIGHT) !== -1)
    return runPlaywrightTests(options)

  return Promise.resolve(null)
}
