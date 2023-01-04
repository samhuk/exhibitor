import { BoolDependant } from '@samhuk/type-helpers'
import * as fs from 'fs'
import path from 'path'
import { NPM_PACKAGE_CAPITALIZED_NAME } from '../../common/name'
import { DEFAULT_CONFIG_FILE_NAME } from '../../common/paths'
import { logStep, logSuccess, logWarn } from '../logging'
import { BaseCliArgumentsOptions, CliError, CliString } from '../types'
import { readAndParseConfig } from './read'

import { Config, ResolvedConfig } from './types'

export const DEFAULT_CONFIG: ResolvedConfig = {
  include: ['./**/*.exh.ts'],
  watch: ['./**/*'],
  site: {
    host: 'localhost',
    port: 4001,
    title: NPM_PACKAGE_CAPITALIZED_NAME,
  },
  verbose: false,
  configDir: undefined,
  rootStyle: undefined,
}

export const makePathRelativeToConfigDir = (p: string, configDir: string): string => (
  // eslint-disable-next-line prefer-regex-literals
  path.join(configDir, p).replace(new RegExp('\\\\', 'g'), '/')
)

export const makePathsRelativeToConfigDir = (paths: string[], configDir: string): string[] => paths
  .map(p => makePathRelativeToConfigDir(p, configDir))

export const resolveConfig = (config?: Config, configFilePath?: string): ResolvedConfig => {
  const configDir = configFilePath != null ? path.dirname(configFilePath) : './'

  return {
    configDir,
    include: makePathsRelativeToConfigDir(config?.include ?? DEFAULT_CONFIG.include, configDir),
    watch: makePathsRelativeToConfigDir(config?.watch ?? DEFAULT_CONFIG.watch, configDir),
    rootStyle: config?.rootStyle != null ? makePathRelativeToConfigDir(config.rootStyle, configDir) : undefined,
    site: {
      host: config?.site?.host != null ? config.site.host : DEFAULT_CONFIG.site.host,
      port: config?.site?.port != null ? config.site.port : DEFAULT_CONFIG.site.port,
      title: config?.site?.title != null ? config.site.title : DEFAULT_CONFIG.site.title,
    },
    verbose: config?.verbose ?? DEFAULT_CONFIG.verbose,
    esbuildConfig: config?.esbuildConfig,
  }
}

const createValidateConfigError = (causedBy: CliString): CliError => ({
  message: 'Invalid configuration',
  causedBy,
})

export const _validateConfig = (config: ResolvedConfig): CliString | null => {
  // -- include
  if (config.include.length < 1)
    return c => `config.include - must have at least one entry, if defined. Received: ${c.cyan(JSON.stringify(config.include))}`

  // -- watch
  if (config.watch.length < 1)
    return c => `config.watch - must have at least one entry, if defined. Received: ${c.cyan(JSON.stringify(config.watch))}`

  // -- site.host
  if (config.site.host.length < 1)
    return 'config.site.host - cannot be empty'

  // -- site.port
  if (typeof config.site.port !== 'number')
    return c => `config.site.port - must be a number. Received: ${c.cyan(JSON.stringify(config.site.port))}`

  if (config.site.port < 1)
    return c => `config.site.port - cannot be less than ${c.cyan('1')}. Received: ${c.cyan(config.site.port.toString())}`

  if (config.site.port > 65535)
    return c => `config.site.port - cannot be greater than ${c.cyan('65535')}. Received: ${c.cyan(config.site.port.toString())}`

  // -- rootStyle
  if (config.rootStyle != null && !fs.existsSync(config.rootStyle))
    return c => `config.rootStyle - path does not exist (${c.cyan(path.resolve(config.rootStyle))})`

  return null
}

export const validateConfig = (config: ResolvedConfig): CliError | null => {
  const errorMessage = _validateConfig(config)

  return errorMessage != null
    ? createValidateConfigError(errorMessage)
    : null
}

type GetConfigResult<
  TSuccess extends boolean = boolean
> = BoolDependant<{
  true: { config: ResolvedConfig }
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
  applyCliArgumentsOptionsToConfig?: (resolvedConfig: ResolvedConfig, cliArgumentsOptions: TCliArgumentsOptions) => CliError | null,
): Promise<GetConfigResult> => {
  // Determine what path to use for config file
  const configFilePathResult = getConfigFilePath(cliArgumentsOptions)
  if (configFilePathResult != null && typeof configFilePathResult === 'object') {
    return {
      success: false,
      error: configFilePathResult,
    }
  }
  const _configFilePathResult = configFilePathResult as string | null
  if (_configFilePathResult == null)
    logWarn('No configuration file provided. Using default configuration with any CLI arguments provided as overrides.', true)
  const config = _configFilePathResult != null ? await readAndParseConfig(_configFilePathResult) : null
  const resolvedConfig = resolveConfig(config, _configFilePathResult)

  // Modify resolved config, if modifier fn is defined.
  logStep('Overriding config from specific file (or default config) with any CLI arguments.', true)
  const modifiedResolvedConfigError = applyCliArgumentsOptionsToConfig(resolvedConfig, cliArgumentsOptions)
  if (modifiedResolvedConfigError != null)
    return { success: false, error: modifiedResolvedConfigError }

  // Validate resolved config
  logStep('Validating configuration.', true)
  const validateConfigError = validateConfig(resolvedConfig)
  if (validateConfigError != null)
    return { success: false, error: validateConfigError }
  logSuccess('Configuration valid.', true)

  return { success: true, config: resolvedConfig }
}
