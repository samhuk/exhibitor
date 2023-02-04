import path from 'path'
import { UnresolvedConfig, Config } from './types'
import { NPM_PACKAGE_CAPITALIZED_NAME } from '../name'
import { readAndParseConfig } from './read'

export const DEFAULT_CONFIG: Config = {
  include: ['./**/*.exh.ts', './**/*.exh.tsx'],
  exclude: [],
  watch: ['./**/*'],
  watchExclude: [],
  site: {
    host: 'localhost',
    port: 4001,
    title: NPM_PACKAGE_CAPITALIZED_NAME,
  },
  verbose: false,
  configDir: undefined,
  rootConfigFile: undefined,
  rootStyle: undefined,
  testers: [],
}

export const CONFIG_FILE_PATH_ENV_VAR_NAME = 'EXH_CONFIG_FILE_PATH'

export const VERBOSE_ENV_VAR_NAME = 'EXH_VERBOSE'

export const makePathRelativeToConfigDir = (p: string, configDir: string): string => (
  // eslint-disable-next-line prefer-regex-literals
  path.join(configDir, p).replace(new RegExp('\\\\', 'g'), '/')
)

export const makePathsRelativeToConfigDir = (paths: string[], configDir: string): string[] => paths
  .map(p => makePathRelativeToConfigDir(p, configDir))

export const resolveConfig = (config?: UnresolvedConfig, configFilePath?: string): Config => {
  const configDir = configFilePath != null ? path.dirname(configFilePath) : './'

  return {
    configDir,
    rootConfigFile: configFilePath,
    include: makePathsRelativeToConfigDir(config?.include ?? DEFAULT_CONFIG.include, configDir),
    exclude: makePathsRelativeToConfigDir(config?.exclude ?? DEFAULT_CONFIG.exclude, configDir),
    watch: makePathsRelativeToConfigDir(config?.watch ?? DEFAULT_CONFIG.watch, configDir),
    watchExclude: makePathsRelativeToConfigDir(config?.watchExclude ?? DEFAULT_CONFIG.watchExclude, configDir),
    rootStyle: config?.rootStyle != null ? makePathRelativeToConfigDir(config.rootStyle, configDir) : undefined,
    site: {
      host: config?.site?.host != null ? config.site.host : DEFAULT_CONFIG.site.host,
      port: config?.site?.port != null ? config.site.port : DEFAULT_CONFIG.site.port,
      title: config?.site?.title != null ? config.site.title : DEFAULT_CONFIG.site.title,
    },
    verbose: config?.verbose ?? DEFAULT_CONFIG.verbose,
    esbuildOptions: config?.esbuildOptions,
    testers: config?.testers ?? DEFAULT_CONFIG.testers,
  }
}

export const getConfig = async (configFilePath?: string): Promise<Config> => {
  const config = configFilePath != null ? await readAndParseConfig(configFilePath) : null
  return resolveConfig(config, configFilePath)
}
