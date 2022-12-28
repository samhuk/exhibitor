import { exit } from 'process'
import { logError } from './logging'
import { CliError } from './types'

export const handleError = (error: CliError) => {
  logError(error)
  exit(1)
}
