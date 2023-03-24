import * as fs from 'fs'
import { createGFError, GFError, GFResult } from 'good-flow'
import path from 'path'
import { getConfig } from '../../common/config'
import { Config } from '../../common/config/types'
import { validateConfig } from '../../common/config/validate'
import { logInfo, logStep, logSuccess, logWarn } from '../../common/logging'
import { DEFAULT_CONFIG_FILE_NAME } from '../../common/paths'
import { BaseCliArgumentsOptions } from '../types'

const getConfigFilePath = (cliArgumentsOptions: BaseCliArgumentsOptions): GFResult<string | null> => {
  if (cliArgumentsOptions.config == null) {
    const defaultPath = path.join('./', DEFAULT_CONFIG_FILE_NAME)
    logStep(c => `'${c.underline('config')}' CLI argument not provided. Checking whether configuration file at default path exists (${c.cyan(defaultPath)}).`, true)
    if (fs.existsSync(defaultPath)) {
      logInfo('Configuration file at default path exists. Using it.', true)
      return [defaultPath]
    }

    logInfo('Configuration file at default path does not exists. Using default configuration.', true)
    return [null]
  }

  logStep(c => `'${c.underline('config')}' CLI argument provided (${c.cyan(cliArgumentsOptions.config)}). Checking whether exists (${c.cyan(path.resolve(cliArgumentsOptions.config))}).`, true)
  if (!fs.existsSync(cliArgumentsOptions.config)) {
    return [undefined, createGFError({
      msg: 'Invalid CLI command argument(s)',
      inner: createGFError({
        msg: c => `Configuration file path does not exist. Received: ${c.cyan(cliArgumentsOptions.config)}. Attempted: ${path.resolve(cliArgumentsOptions.config)}`,
      }),
    })]
  }

  logSuccess('Configuration file found.', true)
  return [cliArgumentsOptions.config]
}

export const getConfigForCommand = async <
  TCliArgumentsOptions extends BaseCliArgumentsOptions
>(
  cliArgumentsOptions: TCliArgumentsOptions,
  applyCliArgumentsOptionsToConfig?: (Config: Config, cliArgumentsOptions: TCliArgumentsOptions) => GFError | null,
): Promise<GFResult<Config>> => {
  // Determine what path to use for config file
  const [configFilePath, configFilePathErr] = getConfigFilePath(cliArgumentsOptions)
  if (configFilePathErr != null)
    return [undefined, configFilePathErr]

  if (configFilePath == null)
    logWarn('No configuration provided. Using default configuration with any CLI arguments provided as overrides.', true)

  const config = await getConfig(configFilePath)

  // Modify resolved config, if modifier fn is defined.
  logStep('Overriding configuration with any CLI arguments.', true)
  const modifiedConfigError = applyCliArgumentsOptionsToConfig(config, cliArgumentsOptions)
  if (modifiedConfigError != null)
    return [undefined, modifiedConfigError]

  // Validate resolved config
  logStep('Validating configuration.', true)
  const validateConfigError = validateConfig(config)
  if (validateConfigError != null)
    return [undefined, validateConfigError]

  logSuccess('Configuration valid.', true)

  return [config]
}
