import { BoolDependant } from '@samhuk/type-helpers'
import colors from 'colors/safe'

export type Colors = typeof colors

export type CliError = {
  message: string | ((c: Colors) => string)
  causedBy?: string | ((c: Colors) => string)
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

const normalizeString = (s: string | ((c: Colors) => string)): string => (
  typeof s === 'function'
    ? s(colors)
    : s
)

export const printErrorResult = (
  result: CommandResult<false>,
): void => {
  console.log(colors.red('Error:'), normalizeString(result.error.message))
  if (result.error.causedBy != null)
    console.log('\n  Caused by:', normalizeString(result.error.causedBy))
}
