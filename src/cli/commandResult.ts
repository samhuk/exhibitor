import { BoolDependant } from '@samhuk/type-helpers'
import colors from 'colors/safe'
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

export const printErrorResult = (
  result: CommandResult<false>,
): void => {
  console.log(colors.red('Error:'), normalizeCliString(result.error.message))
  if (result.error.causedBy != null)
    console.log('\n  Caused by:', normalizeCliString(result.error.causedBy))
}

export const printError = (
  error: CliError,
): void => {
  console.log(colors.red('Error:'), normalizeCliString(error.message))
  if (error.causedBy != null)
    console.log('\n  Caused by:', normalizeCliString(error.causedBy))
}
