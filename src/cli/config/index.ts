import * as fs from 'fs'
import path from 'path'
import { getConfig } from '../../common/config'
import { Config } from '../../common/config/types'
import { validateConfig } from '../../common/config/validate'
import { createExhError } from '../../common/exhError'
import { ExhError } from '../../common/exhError/types'
import { logStep, logSuccess, logWarn } from '../../common/logging'
import { DEFAULT_CONFIG_FILE_NAME } from '../../common/paths'
import { BaseCliArgumentsOptions } from '../types'

const getConfigFilePath = (cliArgumentsOptions: BaseCliArgumentsOptions): ExhError | string | null => {
  if (cliArgumentsOptions.config == null) {
    const defaultPath = path.join('./', DEFAULT_CONFIG_FILE_NAME)
    logStep(c => `'${c.underline('config')}' CLI argument not provided. Checking whether config file at default path exists (${c.cyan(defaultPath)}).`, true)
    return fs.existsSync(defaultPath) ? defaultPath : null
  }

  logStep(c => `'${c.underline('config')}' CLI argument provided (${c.cyan(cliArgumentsOptions.config)}). Checking whether exists (${c.cyan(path.resolve(cliArgumentsOptions.config))}).`, true)
  if (!fs.existsSync(cliArgumentsOptions.config)) {
    return createExhError({
      message: 'Invalid CLI command argument(s)',
      causedBy: c => `Config file path does not exist. Received: ${c.cyan(cliArgumentsOptions.config)}`,
    })
  }

  logSuccess('Configuration file found.', true)
  return cliArgumentsOptions.config
}

export const getConfigForCommand = async <
  TCliArgumentsOptions extends BaseCliArgumentsOptions
>(
  cliArgumentsOptions: TCliArgumentsOptions,
  applyCliArgumentsOptionsToConfig?: (Config: Config, cliArgumentsOptions: TCliArgumentsOptions) => ExhError | null,
): Promise<Config | ExhError> => {
  // Determine what path to use for config file
  const configFilePathResult = getConfigFilePath(cliArgumentsOptions)
  if (configFilePathResult != null && typeof configFilePathResult === 'object')
    return configFilePathResult

  const configFilePath = configFilePathResult as string | null

  if (configFilePath == null)
    logWarn('No configuration provided. Using default configuration with any CLI arguments provided as overrides.', true)
  const config = await getConfig(configFilePath)

  // Modify resolved config, if modifier fn is defined.
  logStep('Overriding configuration with any CLI arguments.', true)
  const modifiedConfigError = applyCliArgumentsOptionsToConfig(config, cliArgumentsOptions)
  if (modifiedConfigError != null)
    return modifiedConfigError

  // Validate resolved config
  logStep('Validating configuration.', true)
  const validateConfigError = validateConfig(config)
  if (validateConfigError != null)
    return validateConfigError

  logSuccess('Configuration valid.', true)

  return config
}
