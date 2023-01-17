import { StartCliArgumentsOptions } from './types'
import { CliError, CliString } from '../../types'
import { Config } from '../../../common/config/types'
import { isValidHost } from '../../../common/network'

const createError = (causedBy: CliString): CliError => ({
  message: 'Could not parse CLI arguments',
  causedBy,
})

export const applyStartOptionsToConfig = (
  config: Config,
  options: StartCliArgumentsOptions,
): CliError | null => {
  if (options.host != null) {
    if (!isValidHost(options.host))
      return createError(c => `argument 'host' is not a valid hostname or IP address. Received: ${c.cyan(JSON.stringify(options.host))}`)

    config.site.host = options.host
  }

  if (options.port != null) {
    const parsedPort = parseInt(options.port)
    if (Number.isNaN(parsedPort))
      return createError(c => `argument 'port' is not a valid integer. Received: ${c.cyan(JSON.stringify(options.port))}`)

    config.site.port = parsedPort
  }

  if (options.verbose != null) {
    if (typeof options.verbose !== 'boolean')
      return createError(c => `argument 'verbose' is not a valid boolean. Received: ${c.cyan(JSON.stringify(options.verbose))}`)

    config.verbose = options.verbose
  }

  return null
}
