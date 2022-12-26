import colors from 'colors/safe'
import { CliError } from './commandResult'
import state from './state'
import { CliString } from './types'

const normalizeCliString = (s: CliString): string => (
  typeof s === 'function'
    ? s(colors)
    : s
)

export const printError = (
  error: CliError,
): void => {
  console.log(colors.red('Error:'), normalizeCliString(error.message))
  if (error.causedBy != null)
    console.log('\n  Caused by:', normalizeCliString(error.causedBy))
}

export const log = (
  msg: CliString | CliError,
  verbose: boolean = false,
) => {
  // If log msg is verbose and the current state is not verbose, then dont log
  if (verbose && !state.verbose)
    return

  if (typeof msg === 'string') {
    console.log(msg)
  }
  else if (typeof msg === 'function') {
    console.log(msg(colors))
  }
  else {
    console.log(colors.red('Error:'), normalizeCliString(msg.message))
    if (msg.causedBy != null)
      console.log('\n  Caused by:', normalizeCliString(msg.causedBy))
  }
}

export const logStep = (
  msg: CliString,
  verbose: boolean = false,
) => {
  // If log msg is verbose and the current state is not verbose, then dont log
  if (verbose && !state.verbose)
    return

  const normalizedMessage = normalizeCliString(msg)
  console.log(`${colors.blue('*')} ${normalizedMessage}`)
}
