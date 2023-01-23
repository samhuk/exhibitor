import * as fs from 'fs'
import { createExhError } from '../../../../common/exhError'
import { ExhError } from '../../../../common/exhError/types'
import { ExhString } from '../../../../common/exhString/types'
import { PLAYWRIGHT_REPORT_FILE, PLAYWRIGHT_HTML_REPORT_DATA_START_TOKEN } from './constants'

const createGetResultsError = (causedBy: ExhString): ExhError => createExhError({
  message: 'Could not determine the Playwright test results',
  causedBy,
})

export const getResults = async (): Promise<string | ExhError> => {
  // If report file doesn't exist, skip
  if (!fs.existsSync(PLAYWRIGHT_REPORT_FILE))
    return createGetResultsError(c => `File ${c.cyan(PLAYWRIGHT_REPORT_FILE)} could not be found`)

  // Read in report file text
  const htmlReportString = fs.readFileSync(PLAYWRIGHT_REPORT_FILE, { encoding: 'utf8' })
  // Find the point at a bit before where the report data starts
  const indexOfMarker = htmlReportString.indexOf(PLAYWRIGHT_HTML_REPORT_DATA_START_TOKEN)
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
