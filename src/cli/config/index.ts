import { BoolDependant } from '@samhuk/type-helpers'
import * as fs from 'fs'
import path from 'path'
import { getConfig } from '../../common/config'
import { Config } from '../../common/config/types'
import { validateConfig } from '../../common/config/validate'
import { DEFAULT_CONFIG_FILE_NAME } from '../../common/paths'
import { logStep, logSuccess, logWarn } from '../logging'
import { BaseCliArgumentsOptions, CliError } from '../types'

type GetConfigResult<
  TSuccess extends boolean = boolean
> = BoolDependant<{
  true: { config: Config }
  false: { error: CliError }
}, TSuccess, 'success'>

const getConfigFilePath = (cliArgumentsOptions: BaseCliArgumentsOptions): CliError | string | null => {
  if (cliArgumentsOptions.config == null) {
    const defaultPath = path.join('./', DEFAULT_CONFIG_FILE_NAME)
    logStep(c => `'${c.underline('config')}' CLI argument not provided. Checking whether config file at default path exists (${c.cyan(defaultPath)}).`, true)
    return fs.existsSync(defaultPath) ? defaultPath : null
  }

  logStep(c => `'${c.underline('config')}' CLI argument provided (${c.cyan(cliArgumentsOptions.config)}). Checking whether exists (${c.cyan(path.resolve(cliArgumentsOptions.config))}).`, true)
  if (!fs.existsSync(cliArgumentsOptions.config)) {
    return {
      message: 'Invalid CLI command argument(s)',
      causedBy: c => `Config file path does not exist. Received: ${c.cyan(cliArgumentsOptions.config)}`,
    }
  }

  logSuccess('Configuration file found.', true)
  return cliArgumentsOptions.config
}

export const getConfigForCommand = async <
  TCliArgumentsOptions extends BaseCliArgumentsOptions
>(
  cliArgumentsOptions: TCliArgumentsOptions,
  applyCliArgumentsOptionsToConfig?: (Config: Config, cliArgumentsOptions: TCliArgumentsOptions) => CliError | null,
): Promise<GetConfigResult> => {
  // Determine what path to use for config file
  const configFilePathResult = getConfigFilePath(cliArgumentsOptions)
  if (configFilePathResult != null && typeof configFilePathResult === 'object') {
    return {
      success: false,
      error: configFilePathResult,
    }
  }
  const configFilePath = configFilePathResult as string | null

  if (configFilePath == null)
    logWarn('No configuration provided. Using default configuration with any CLI arguments provided as overrides.', true)
  const config = await getConfig(configFilePath)

  // Modify resolved config, if modifier fn is defined.
  logStep('Overriding configuration with any CLI arguments.', true)
  const modifiedConfigError = applyCliArgumentsOptionsToConfig(config, cliArgumentsOptions)
  if (modifiedConfigError != null)
    return { success: false, error: modifiedConfigError }

  // Validate resolved config
  logStep('Validating configuration.', true)
  const validateConfigError = validateConfig(config)
  if (validateConfigError != null)
    return { success: false, error: validateConfigError }
  logSuccess('Configuration valid.', true)

  return { success: true, config }
}
