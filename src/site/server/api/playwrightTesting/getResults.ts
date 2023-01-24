import * as fs from 'fs'
import { createExhError } from '../../../../common/exhError'
import { ExhError } from '../../../../common/exhError/types'
import { ExhString } from '../../../../common/exhString/types'
import { PLAYWRIGHT_REPORT_FILE } from './constants'

const createGetResultsError = (causedBy: ExhString): ExhError => createExhError({
  message: 'Could not determine the Playwright test results',
  causedBy,
})

export const getResults = async (): Promise<string | ExhError> => {
  // If report file doesn't exist, skip
  if (!fs.existsSync(PLAYWRIGHT_REPORT_FILE))
    return createGetResultsError(c => `File ${c.cyan(PLAYWRIGHT_REPORT_FILE)} could not be found`)

  return fs.readFileSync(PLAYWRIGHT_REPORT_FILE, { encoding: 'utf8' })
}
