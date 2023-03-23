import { createGFError, GFError } from 'good-flow'
import { GFString } from 'good-flow/lib/good-flow/string/types'
import { DemoCliArgumentsOptions } from './types'
import { Config } from '../../../common/config/types'

const createError = (cause: GFString): GFError => createGFError({
  msg: 'Could not parse CLI arguments',
  inner: createGFError({ msg: cause }),
})

const createInvalidTypeError = (argName: string, recievedValue: any, expectedType: string) => (
  createError(c => `argument '${c.bold(argName)}' is not a valid ${expectedType}. Received: ${c.cyan(JSON.stringify(recievedValue))}`)
)

export const applyDemoOptionsToConfig = (
  config: Config,
  options: DemoCliArgumentsOptions,
): GFError | null => {
  if (options.verbose != null) {
    if (typeof options.verbose !== 'boolean')
      return createInvalidTypeError('verbose', options.verbose, 'boolean')

    config.verbose = options.verbose
  }

  if (options.outDir != null) {
    if (typeof options.outDir !== 'string')
      return createInvalidTypeError('outDir', options.outDir, 'string')
    if (options.outDir.length === 0)
      return createError(c => `argument '${c.bold('outDir')}' cannot be empty. Received: ${c.cyan(JSON.stringify(options.outDir))}`)

    config.demo.outDir = options.outDir
  }

  return null
}
