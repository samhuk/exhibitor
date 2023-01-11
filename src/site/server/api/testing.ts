import { fork } from 'child_process'
import path from 'path'
import * as fs from 'fs'
import { VARIANT_PATH_ENV_VAR_NAME } from '../../../common/testing'
import { PlaywrightTestResults, RunE2eTestOptions } from '../../common/e2eTesting'
import { JSON_REPORTER_FILE } from '../../../common/paths'
import { config } from '../config'
import { Tester } from '../../../cli/config/types'
import { tryResolve } from '../../../common/npm'
import { logError, logStep } from '../../../cli/logging'

const runPlaywrightTests = (
  options: RunE2eTestOptions,
) => new Promise<PlaywrightTestResults>((res, rej) => {
  // Determine where the playwright CLI js file is
  const playwrightCliJsResolveResult = tryResolve('playwright-core/cli')
  if (playwrightCliJsResolveResult.success === false) {
    logError({
      message: 'Could not execute Playwright tests.',
      causedBy: c => `Could not resolve ${c.underline('playwright-core/cli')}. Try ${c.bold('npm i --save-dev playwright-core')}`,
    })
    return
  }

  const playwrightCliJsPath = playwrightCliJsResolveResult.path

  logStep(c => `Server got this config:\n${c.cyan(JSON.stringify(config.testers, null, 2))}`, true)

  const absTestFilePath = path.join(path.dirname(options.exhibitSrcFilePath), options.testFilePath).replace(/\\/g, '/')

  logStep(c => `Executing playwright test: ${c.cyan(absTestFilePath)}`, true)

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
