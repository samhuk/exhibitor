import { StartCliArgumentsOptions } from './types'
import { CliError } from '../../commandResult'
import { ResolvedConfig } from '../../config/types'

export const applyStartOptionsToConfig = (
  config: ResolvedConfig,
  options: StartCliArgumentsOptions,
): CliError | null => {
  if (options.host != null)
    config.site.host = options.host

  if (options.port != null) {
    const parsedPort = parseInt(options.port)
    if (Number.isNaN(parsedPort)) {
      return {
        message: 'Could not parse CLI arguments',
        causedBy: c => `argument 'port' is not a valid integer. Received: ${c.cyan(JSON.stringify(options.port))}`,
      }
    }

    config.site.port = parsedPort
  }

  return null
}
