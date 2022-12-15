import { BoolDependant } from '@samhuk/type-helpers'
import * as fs from 'fs'
import path from 'path'
import { DEFAULT_CONFIG_FILE_NAME } from '../../common/paths'
import { CliError } from '../commandResult'
import { BaseCliArgumentsOptions, CliString } from '../types'

import { Config, ResolvedConfig } from './types'

export const DEFAULT_CONFIG: ResolvedConfig = {
  include: ['./**/*.exh.ts'],
  watch: ['./**/*'],
  site: {
    host: 'localhost',
    port: 4001,
  },
  verbose: false,
  configDir: undefined,
  rootStyle: undefined,
}

export const readAndParseConfig = (
  configFilePath: string = './',
): Config => {
  const configString = fs.readFileSync(configFilePath, { encoding: 'utf8' })
  return JSON.parse(configString) as Config
}

export const makePathRelativeToConfigDir = (p: string, configDir: string): string => (
  // eslint-disable-next-line prefer-regex-literals
  path.join(configDir, p).replace(new RegExp('\\\\', 'g'), '/')
)

export const makePathsRelativeToConfigDir = (paths: string[], configDir: string): string[] => paths
  .map(p => makePathRelativeToConfigDir(p, configDir))

export const resolveConfig = (configFilePath: string, config?: Config): ResolvedConfig => {
  const configDir = path.dirname(configFilePath)

  return {
    configDir,
    include: makePathsRelativeToConfigDir(config?.include ?? DEFAULT_CONFIG.include, configDir),
    watch: makePathsRelativeToConfigDir(config?.watch ?? DEFAULT_CONFIG.watch, configDir),
    rootStyle: config?.rootStyle != null ? makePathRelativeToConfigDir(config.rootStyle, configDir) : undefined,
    site: {
      host: config?.site?.host != null ? config.site.host : DEFAULT_CONFIG.site.host,
      port: config?.site?.port != null ? config.site.port : DEFAULT_CONFIG.site.port,
    },
    verbose: config?.verbose ?? DEFAULT_CONFIG.verbose,
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

export const getConfigForCommand = <
  TCliArgumentsOptions extends BaseCliArgumentsOptions
  >(
    cliArgumentsOptions: TCliArgumentsOptions,
    applyCliArgumentsOptionsToConfig?: (resolvedConfig: ResolvedConfig, cliArgumentsOptions: TCliArgumentsOptions) => CliError | null,
  ): GetConfigResult => {
  // Determine what path to use for config file
  let configFilePath: string
  if (cliArgumentsOptions.config != null) {
    if (fs.existsSync(cliArgumentsOptions.config)) {
      configFilePath = cliArgumentsOptions.config
    }
    else {
      return {
        success: false,
        error: {
          message: 'Invalid CLI command argument(s)',
          causedBy: c => `config file path does not exist. Received: ${c.cyan(cliArgumentsOptions.config)}`,
        },
      }
    }
  }
  else if (fs.existsSync(path.join('./', DEFAULT_CONFIG_FILE_NAME))) {
    configFilePath = path.join('./', DEFAULT_CONFIG_FILE_NAME)
  }
  const config = configFilePath != null ? readAndParseConfig(configFilePath) : null
  const resolvedConfig = resolveConfig(configFilePath, config)

  // Modify resolved config, if modifier fn is defined.
  const modifiedResolvedConfigError = applyCliArgumentsOptionsToConfig(resolvedConfig, cliArgumentsOptions)
  if (modifiedResolvedConfigError != null)
    return { success: false, error: modifiedResolvedConfigError }

  // Validate resolved config
  const validateConfigError = validateConfig(resolvedConfig)
  if (validateConfigError != null)
    return { success: false, error: validateConfigError }

  return { success: true, config: resolvedConfig }
}