import colors, { bold } from 'colors/safe'
import { isExhError } from '../exhError'

import { ExhError } from '../exhError/types'
import { normalizeExhString } from '../exhString'
import { ExhString } from '../exhString/types'
import state from '../processState'

const _logText = (msg: ExhString) => console.log(normalizeExhString(msg))

export const log = (
  msg: ExhString | ExhError,
  verbose: boolean = false,
) => {
  // If log msg is verbose and the current state is not verbose, then dont log
  if (verbose && !state.verbose)
    return

  if (isExhError(msg)) {
    console.log(colors.red('Error:'), normalizeExhString(msg.message))
    if (msg.causedBy != null)
      console.log('\n  Caused by:', normalizeExhString(msg.causedBy))
  }
  else {
    _logText(msg)
  }
}

export const logText = (
  msg: ExhString,
  verbose: boolean = false,
) => {
  // If log msg is verbose and the current state is not verbose, then dont log
  if (verbose && !state.verbose)
    return

  _logText(msg)
}

/**
 * Prints a step header message to console stdout.
 *
 * @example
 * logStepHeader('Doing something') // ⚫ == Doing something ==
 */
export const logStepHeader = (
  msg: ExhString,
  verbose: boolean = false,
) => {
  // If log msg is verbose and the current state is not verbose, then dont log
  if (verbose && !state.verbose)
    return

  const normalizedMessage = normalizeExhString(msg)
  console.log(`${colors.blue('⚫')} == ${colors.underline(normalizedMessage)} ==`)
}

/**
 * Prints a step message to console stdout.
 *
 * @example
 * logStep('Doing something') // ⚫ Doing something
 */
export const logStep = (
  msg: ExhString,
  verbose: boolean = false,
) => {
  // If log msg is verbose and the current state is not verbose, then dont log
  if (verbose && !state.verbose)
    return

  const normalizedMessage = normalizeExhString(msg)
  console.log(`${colors.blue('⚫')} ${normalizedMessage}`)
}

/**
 * Prints an informational message to console stdout.
 *
 * @example
 * logInfo('This is a thing') // i  This is a thing
 */
export const logInfo = (
  msg: ExhString,
  verbose: boolean = false,
) => {
  // If log msg is verbose and the current state is not verbose, then dont log
  if (verbose && !state.verbose)
    return

  const normalizedMessage = normalizeExhString(msg)
  console.log(`${colors.blue('i')}  ${normalizedMessage}`)
}

/**
 * Prints a success message to console stdout.
 *
 * @example
 * logSuccess('Done a thing') // ✔  Done a thing
 */
export const logSuccess = (
  msg: ExhString,
  verbose: boolean = false,
) => {
  // If log msg is verbose and the current state is not verbose, then dont log
  if (verbose && !state.verbose)
    return

  const normalizedMessage = normalizeExhString(msg)
  console.log(`${colors.green('✔')}  ${normalizedMessage}`)
}

/**
 * Prints a warning message to console stdout.
 *
 * @example
 * logWarn('Did not do a thing') // Warn: Did not do a thing
 */
export const logWarn = (
  msg: ExhString,
  verbose: boolean = false,
) => {
  // If log msg is verbose and the current state is not verbose, then dont log
  if (verbose && !state.verbose)
    return

  const normalizedMessage = normalizeExhString(msg)
  console.log(`${colors.yellow('Warn:')} ${normalizedMessage}`)
}

/**
 * Prints an error message to console stdout.
 *
 * @example
 * logError({
 *   message: 'Did not do a thing',
 *   causedBy: 'Because it did not',
 * })
 * // Error: Did not do a thing
 * //    Caused by: Because it did not
 */
export const logError = (
  error: ExhError,
) => {
  const normalizedMessage = normalizeExhString(error.message)
  const normalizedCausedBy = error.causedBy != null ? normalizeExhString(error.causedBy) : null

  console.log(colors.red('Error:'), normalizedMessage)
  if (normalizedCausedBy != null)
    console.log('\n  Caused by:', normalizedCausedBy)
}

/**
 * Prints a message to console stdout that is related to the intercom functionality.
 *
 * @example
 * logIntercomInfo('Did something') // -- IC -- i  Did something
 */
export const logIntercomInfo = (
  msg: ExhString,
) => {
  // If log msg is verbose and the current state is not verbose, then dont log
  if (process.env.EXH_SHOW_INTERCOM_LOG !== 'true')
    return

  const normalizedMessage = normalizeExhString(msg)
  console.log(`${(colors.bgWhite as any).black('-- IC --')} ${colors.blue('i')}  ${normalizedMessage}`)
}

/**
 * Prints a message to console stdout that is related to the intercom functionality.
 *
 * @example
 * logIntercomStep('Doing something') // -- IC -- ⚫ Doing something
 */
export const logIntercomStep = (
  msg: ExhString,
) => {
  // If log msg is verbose and the current state is not verbose, then dont log
  if (process.env.EXH_SHOW_INTERCOM_LOG !== 'true')
    return

  const normalizedMessage = normalizeExhString(msg)
  console.log(`${(colors.bgWhite as any).black('-- IC --')} ${colors.blue('⚫')} ${normalizedMessage}`)
}

/**
 * Prints a message to console stdout that is related to the intercom functionality.
 *
 * @example
 * logIntercomSuccess('Did something') // -- IC -- ✔ Did something
 */
export const logIntercomSuccess = (
  msg: ExhString,
) => {
  // If log msg is verbose and the current state is not verbose, then dont log
  if (process.env.EXH_SHOW_INTERCOM_LOG !== 'true')
    return

  const normalizedMessage = normalizeExhString(msg)
  console.log(`${(colors.bgWhite as any).black('-- IC --')} ${colors.green('✔')} ${normalizedMessage}`)
}

/**
 * Prints a message to console stdout that is related to the intercom functionality.
 *
 * @example
 * logIntercomProblem('Doing something') // -- IC -- Doing something
 */
export const logIntercomError = (
  msg: ExhString,
) => {
  // If log msg is verbose and the current state is not verbose, then dont log
  if (process.env.EXH_SHOW_INTERCOM_LOG !== 'true')
    return

  const normalizedMessage = normalizeExhString(msg)
  console.log(`${(colors.bgWhite as any).black('-- IC --')} ${colors.red('x')}  ${normalizedMessage}`)
}
