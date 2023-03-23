// eslint-disable-next-line import/no-unresolved
import { PlaywrightTestConfig } from '@playwright/test/types/test'
import { fork } from 'child_process'
import * as fs from 'fs'
import { createGFError } from 'good-flow'
import path from 'path'
import { logStep, logSuccess, logWarn } from '../../../../common/logging'
import { checkPackages } from '../../../../common/npm/checkPackages'
import { VARIANT_PATH_ENV_VAR_NAME } from '../../../../common/testing'
import { RunPlaywrightTestsOptions } from '../../../common/testing/playwright'
import { PLAYWRIGHT_REPORTS_DIR, PLAYWRIGHT_BASE_CONFIG_TEST_DIR, PLAYWRIGHT_BASE_CONFIG_FILE, REQUIRED_PACKAGES } from './constants'
import { getResults, removeCurrentResults } from './getResults'
import { RunPlaywrightTestsResult } from './types'

const setPlaywrightConfig = (
  options: RunPlaywrightTestsOptions,
) => {
  const playwrightConfig: PlaywrightTestConfig = {
    reporter: [
      ['html', { open: 'never', outputFolder: PLAYWRIGHT_REPORTS_DIR }],
      ['list'],
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
  options: RunPlaywrightTestsOptions,
) => new Promise<RunPlaywrightTestsResult>((res, rej) => {
  // Check that required packages are installed
  const result = checkPackages(REQUIRED_PACKAGES, { stopOnError: true })
  if (result.hasErrors === true) {
    const recommendedPackageName = result.error.name === 'playwright-core/cli' ? 'playwright-core' : result.error.name
    const err = createGFError({
      msg: 'Could not execute Playwright test(s).',
      inner: createGFError({
        msg: c => `Could not resolve ${c.underline(result.error.name)}.`,
        inner: createGFError(result.error.errorMsg),
      }),
      advice: {
        tips: c => `Try ${c.bold(`npm i --save-dev ${recommendedPackageName}`)}.`,
      },
    })
    res([undefined, err])
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
  // Clear any lingering results from the previous run, if they exist
  removeCurrentResults()
  // Run playwright test
  logStep(c => `Executing Playwright test file: ${c.cyan(testFilePath)}. Playwright output:`)
  const testProcess = fork(playwrightCliJsPath, args, { silent: true })

  const stdOutList: string[] = []
  const stdErrList: string[] = []
  let nonTestErrorCount: number = 0

  const filteredStdOutList = [
    '\n',
    '\n\n',
  ]

  const omittedStdOutFragmentList = [
    // eslint-disable-next-line max-len
    'To open last HTML report run:\n',
    '\x1b[36m\x1b[39m\n\x1b[36m  npx playwright show-report .exh\\playwright-reports\x1b[39m\n\x1b[36m\x1b[39m\n',
  ]

  // TODO: Currently we are just logging stdio from playwright process to our stdout. This should be improved & configurable.
  testProcess.stdout.on('data', data => {
    const dataStr = String(data)
    if (filteredStdOutList.indexOf(dataStr) !== -1)
      return

    let cleaned = dataStr
    for (let i = 0; i < omittedStdOutFragmentList.length; i += 1)
      cleaned = cleaned.replace(omittedStdOutFragmentList[i], '')

    // If cleaned stdout is only whitespace, ignore it
    if (cleaned.replace(/\s/g, '').length === 0)
      return

    const nonTestErrorRegexResult = /([0-9]*) error was not a part of any test/.exec(cleaned)
    if (nonTestErrorRegexResult != null)
      nonTestErrorCount = parseInt(nonTestErrorRegexResult[1])

    stdOutList.push(cleaned)
    console.log(cleaned)
  })
  testProcess.stderr.on('data', data => {
    const dataStr = String(data)
    if (filteredStdOutList.indexOf(dataStr) !== -1)
      return

    stdErrList.push(dataStr)
    console.log(dataStr)
  })
  testProcess.on('exit', (code, signal) => getResults().then(([results, getResultsError]) => {
    if (code === 0)
      logSuccess('Playwright successfully exited.')
    if (code !== 0)
      logWarn(c => `Playwright exited with code ${c.yellow(code.toString())}. This could indicate that either test(s) failed, there was test compilation errors, or Playwright is incorrectly configured or on an unsupported version.`)

    if (getResultsError != null)
      res([undefined, getResultsError])
    else
      res([{ htmlReportData: results, stdOutList, variantPath: options.variantPath, nonTestErrorCount }])
  }))
})
