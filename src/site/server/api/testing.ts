import { fork } from 'child_process'
import path from 'path'
import * as fs from 'fs'
// eslint-disable-next-line import/no-unresolved
import { PlaywrightTestConfig } from '@playwright/test/types/test'
// import { HTMLReport } from 'packages\html-reporter\src\types.ts'
import { VARIANT_PATH_ENV_VAR_NAME } from '../../../common/testing'
import { RunE2eTestOptions } from '../../common/e2eTesting'
import { BUILD_OUTPUT_ROOT_DIR } from '../../../common/paths'
import { config } from '../config'
import { log, logError, logStep } from '../../../cli/logging'
import { tryResolve } from '../../../common/npm/resolve'
import { Tester } from '../../../common/config/types'

const PLAYWRIGHT_REPORTS_DIR = 'playwright-reports'
const PLAYWRIGHT_REPORT_OUTFILENAME = 'index.html'
const PLAYWRIGHT_REPORT_FILE_REL = `${PLAYWRIGHT_REPORTS_DIR}/${PLAYWRIGHT_REPORT_OUTFILENAME}` as const
const PLAYWRIGHT_REPORT_FILE = `${BUILD_OUTPUT_ROOT_DIR}/${PLAYWRIGHT_REPORT_FILE_REL}` as const
const PLAYWRIGHT_BASE_CONFIG_FILE = `${BUILD_OUTPUT_ROOT_DIR}/playright-base-config.json` as const
const PLAYWRIGHT_BASE_CONFIG_TEST_DIR = path.relative(BUILD_OUTPUT_ROOT_DIR, './') // I.e. ../

const extractPlaywrightHtmlReporterData = async (): Promise<string> => {
  // If report file doesn't exist, skip
  if (!fs.existsSync(PLAYWRIGHT_REPORT_FILE))
    return null

  // Read in report file text
  const htmlReportString = fs.readFileSync(PLAYWRIGHT_REPORT_FILE, { encoding: 'utf8' })
  // Find the point at a bit before where the report data starts
  const indexOfMarker = htmlReportString.indexOf('window.playwrightReportBase64 =')
  if (indexOfMarker === -1)
    return null

  // Find the point at where the report data starts
  const startOfBase64String = htmlReportString.indexOf('"', indexOfMarker) + 1
  if (startOfBase64String === -1)
    return null

  // Find the point at where the report data ends
  const endOfBase64String = htmlReportString.indexOf('"', startOfBase64String)
  if (endOfBase64String === -1)
    return null

  // Extract the report data string
  const dataString = htmlReportString.substring(startOfBase64String, endOfBase64String).substring('data:application/zip;base64,'.length)
  if (dataString.length < 5) // TODO: What should be the lower bound?
    return null

  return dataString
}

const setPlaywrightConfig = (
  options: RunE2eTestOptions,
) => {
  const playwrightConfig: PlaywrightTestConfig = {
    reporter: [
      ['html', { open: 'never', outputFolder: './playwright-reports', outputFile: 'index.html' }],
    ],
    use: {
      headless: options.headless,
    },
    testDir: PLAYWRIGHT_BASE_CONFIG_TEST_DIR,
  }
  fs.writeFileSync(PLAYWRIGHT_BASE_CONFIG_FILE, JSON.stringify(playwrightConfig, null, 2))
}

const runPlaywrightTests = (
  options: RunE2eTestOptions,
) => new Promise<string>((res, rej) => {
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

  const testFilePath = path.join(path.dirname(options.exhibitSrcFilePath), options.testFilePath).replace(/\\/g, '/')

  logStep(c => `Executing playwright test: ${c.cyan(testFilePath)}`, true)

  // Add on our own environment variables
  process.env[VARIANT_PATH_ENV_VAR_NAME] = options.variantPath

  setPlaywrightConfig(options)

  // Build up playwright CLI test command arguments
  const args = ['test', testFilePath, `--config=${PLAYWRIGHT_BASE_CONFIG_FILE}`]

  // Run playwright test
  const testProcess = fork(playwrightCliJsPath, args, { silent: true })

  testProcess.stdout.on('data', data => {
    log(`Playwright stdout: ${String(data)}`)
  })

  testProcess.stderr.on('data', data => {
    log(`Playwright stderr: ${String(data)}`)
  })

  testProcess.on('exit', (code, signal) => {
    extractPlaywrightHtmlReporterData().then(res)
  })
})

export const runTests = (
  options: RunE2eTestOptions,
): Promise<string | null> => {
  if (config.testers.findIndex(tester => tester.type === Tester.PLAYWRIGHT) !== -1)
    return runPlaywrightTests(options)

  return Promise.resolve(null)
}
