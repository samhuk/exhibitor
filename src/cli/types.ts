import colors from 'colors/safe'

export type Colors = typeof colors

export type CliString = string | ((c: Colors) => string)

export type BaseCliArgumentsOptions = {
  config?: string
}

export type CliError = {
  message: CliString
  causedBy?: CliString
  trace?: string
  data?: any
  /**
   * @default false
   */
  askIfShouldContinue?: boolean
}
