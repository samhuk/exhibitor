import { BaseCliArgumentsOptions } from '../../types'

export type StartCliArgumentsOptions = BaseCliArgumentsOptions & {
  port?: string
  host?: string
}
