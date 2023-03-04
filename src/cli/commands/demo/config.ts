import { DemoCliArgumentsOptions } from './types'
import { Config } from '../../../common/config/types'
import { ExhString } from '../../../common/exhString/types'
import { ExhError } from '../../../common/exhError/types'
import { createExhError } from '../../../common/exhError'

const createError = (causedBy: ExhString): ExhError => createExhError({
  message: 'Could not parse CLI arguments',
  causedBy,
})

export const applyDemoOptionsToConfig = (
  config: Config,
  options: DemoCliArgumentsOptions,
): ExhError | null => {
  if (options.verbose != null) {
    if (typeof options.verbose !== 'boolean')
      return createError(c => `argument 'verbose' is not a valid boolean. Received: ${c.cyan(JSON.stringify(options.verbose))}`)

    config.verbose = options.verbose
  }

  return null
}
