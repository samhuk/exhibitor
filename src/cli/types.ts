import colors from 'colors/safe'

export type Colors = typeof colors

export type CliString = string | ((c: Colors) => string)

export type BaseCliArgumentsOptions = {
  config?: string
}
