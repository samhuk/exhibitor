// eslint-disable-next-line import/no-unresolved
import { PlaywrightTestConfig } from '@playwright/test/types/test'
import { fork } from 'child_process'
import * as fs from 'fs'
import path from 'path'
import { logStep } from '../../../../cli/logging'
import { createExhError, isExhError } from '../../../../common/exhError'
import { log } from '../../../../common/logging'
import { checkPackages } from '../../../../common/npm/checkPackages'
import { VARIANT_PATH_ENV_VAR_NAME } from '../../../../common/testing'
import { RunE2eTestOptions } from '../../../common/e2eTesting'
import { PLAYWRIGHT_REPORTS_DIR, PLAYWRIGHT_BASE_CONFIG_TEST_DIR, PLAYWRIGHT_BASE_CONFIG_FILE, REQUIRED_PACKAGES } from './constants'
import { getResults } from './getResults'
import { RunPlaywrightTestsResult } from './types'

const setPlaywrightConfig = (
  options: RunE2eTestOptions,
) => {
  const playwrightConfig: PlaywrightTestConfig = {
    reporter: [
      ['html', { open: 'never', outputFolder: PLAYWRIGHT_REPORTS_DIR }],
      ['playwright-html-data-reporter'],
    ],
    use: {
      headless: options.headless,
    },
    testDir: PLAYWRIGHT_BASE_CONFIG_TEST_DIR,
  }
  logStep(c => `Writing playwright config to ${c.cyan(PLAYWRIGHT_BASE_CONFIG_FILE)}`, true)
  fs.writeFileSync(PLAYWRIGHT_BASE_CONFIG_FILE, JSON.stringify(playwrightConfig, null, 2))
}

export const runPlaywrightTests = (
  options: RunE2eTestOptions,
) => new Promise<RunPlaywrightTestsResult>((res, rej) => {
  // Check that required packages are installed
  const result = checkPackages(REQUIRED_PACKAGES, { stopOnError: true })
  if (result.hasErrors === true) {
    const recommendedPackageName = result.error.name === 'playwright-core/cli' ? 'playwright-core' : result.error.name
    res({
      success: false,
      error: createExhError({
        message: 'Could not execute Playwright test(s).',
        causedBy: c => `Could not resolve ${c.underline(result.error.name)}. Error: ${result.error}`,
        advice: c => `Try ${c.bold(`npm i --save-dev ${recommendedPackageName}`)}.`,
        log: true,
      }),
    })
    return
  }

  // Create paths to required files
  const playwrightCliJsPath = result.results['playwright-core/cli'].path
  const testFilePath = path.join(path.dirname(options.exhibitSrcFilePath), options.testFilePath).replace(/\\/g, '/')
  // Add on our own environment variables
  process.env[VARIANT_PATH_ENV_VAR_NAME] = options.variantPath
  setPlaywrightConfig(options)
  // Build up playwright CLI test command arguments
  const args = ['test', testFilePath, `--config=${PLAYWRIGHT_BASE_CONFIG_FILE}`]
  // Run playwright test
  logStep(c => `Executing playwright test: ${c.cyan(testFilePath)}`)
  const testProcess = fork(playwrightCliJsPath, args, { silent: true })

  // TODO: Currently we are just logging stdio from playwright process to our stdout. This should be improved & configurable.
  testProcess.stdout.on('data', data => log(`[Playwright stdout]> ${String(data)}`))
  testProcess.stderr.on('data', data => log(`[Playwright stderr]>: ${String(data)}`))
  testProcess.on('exit', (code, signal) => getResults().then(results => {
    if (isExhError(results))
      res({ success: false, error: results })
    else
      res({ success: true, htmlReportData: results })
  }))
})
