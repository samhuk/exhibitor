import * as fs from 'fs'
import { createGFError, GFError, GFResult } from 'good-flow'
import { GFString } from 'good-flow/lib/good-flow/string/types'
import { PLAYWRIGHT_REPORT_FILE, PLAYWRIGHT_REPORT_HTML_FILE } from './constants'

const createGetResultsError = (cause: GFString): GFError => createGFError({
  msg: 'Could not determine the Playwright test results',
  inner: createGFError(cause),
})

export const removeCurrentResults = (): void => {
  if (fs.existsSync(PLAYWRIGHT_REPORT_FILE))
    fs.rmSync(PLAYWRIGHT_REPORT_FILE)
  if (fs.existsSync(PLAYWRIGHT_REPORT_HTML_FILE))
    fs.rmSync(PLAYWRIGHT_REPORT_HTML_FILE)
}

export const getResults = async (): Promise<GFResult<string>> => {
  // If report file doesn't exist
  if (!fs.existsSync(PLAYWRIGHT_REPORT_FILE))
    return [undefined, createGetResultsError(c => `File ${c.cyan(PLAYWRIGHT_REPORT_FILE)} could not be found`)]

  return [fs.readFileSync(PLAYWRIGHT_REPORT_FILE, { encoding: 'utf8' })]
}
