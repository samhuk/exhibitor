import { BoolDependant } from '@samhuk/type-helpers'
import colors from 'colors/safe'
import { exit } from 'process'
import { CliString } from './types'

export type CliError = {
  message: CliString
  causedBy?: CliString
  trace?: string
  data?: any
}

export type CommandResult<
  TSuccess extends boolean = boolean
> = BoolDependant<{
  true: {

  }
  false: {
    error: CliError
  }
}, TSuccess, 'success'>

export const errorResult = (
  error: CliError,
): CommandResult<false> => ({
  success: false,
  error,
})

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

export const handleError = (error: CliError) => {
  printError(error)
  exit(1)
}

export const printCliString = (s: CliString) => (
  console.log(normalizeCliString(s))
)
