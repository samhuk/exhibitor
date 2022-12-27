import { StartCliArgumentsOptions } from './types'
import { ResolvedConfig } from '../../config/types'
import { CliError, CliString } from '../../types'

const VALID_IP_ADDRESS_REGEX = /^(([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])\.){3}([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])$/

// eslint-disable-next-line no-useless-escape
const VALID_HOSTNAME_REGEX = /^(([a-zA-Z0-9]|[a-zA-Z0-9][a-zA-Z0-9\-]*[a-zA-Z0-9])\.)*([A-Za-z0-9]|[A-Za-z0-9][A-Za-z0-9\-]*[A-Za-z0-9])$/

const createError = (causedBy: CliString): CliError => ({
  message: 'Could not parse CLI arguments',
  causedBy,
})

export const applyStartOptionsToConfig = (
  config: ResolvedConfig,
  options: StartCliArgumentsOptions,
): CliError | null => {
  if (options.host != null) {
    if (!VALID_IP_ADDRESS_REGEX.test(options.host) && !VALID_HOSTNAME_REGEX.test(options.host))
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
