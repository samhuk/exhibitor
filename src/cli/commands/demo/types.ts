import { BaseCliArgumentsOptions } from '../../types'

export type DemoCliArgumentsOptions = BaseCliArgumentsOptions & {
  verbose?: boolean
  outDir?: string
}
