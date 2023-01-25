import * as fs from 'fs'
import { createExhError } from '../../../../common/exhError'
import { ExhError } from '../../../../common/exhError/types'
import { ExhString } from '../../../../common/exhString/types'
import { PLAYWRIGHT_REPORT_FILE, PLAYWRIGHT_REPORT_HTML_FILE } from './constants'

const createGetResultsError = (causedBy: ExhString): ExhError => createExhError({
  message: 'Could not determine the Playwright test results',
  causedBy,
})

export const removeCurrentResults = (): void => {
  if (fs.existsSync(PLAYWRIGHT_REPORT_FILE))
    fs.rmSync(PLAYWRIGHT_REPORT_FILE)
  if (fs.existsSync(PLAYWRIGHT_REPORT_HTML_FILE))
    fs.rmSync(PLAYWRIGHT_REPORT_HTML_FILE)
}

export const getResults = async (): Promise<string | ExhError> => {
  // If report file doesn't exist
  if (!fs.existsSync(PLAYWRIGHT_REPORT_FILE))
    return createGetResultsError(c => `File ${c.cyan(PLAYWRIGHT_REPORT_FILE)} could not be found`)

  return fs.readFileSync(PLAYWRIGHT_REPORT_FILE, { encoding: 'utf8' })
}
