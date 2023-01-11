import { ResolvedConfig } from '../cli/config/types'
import { NPM_PACKAGE_CAPITALIZED_NAME } from './name'

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
  rootConfigFile: undefined,
  rootStyle: undefined,
  testers: [],
}

export const CONFIG_FILE_PATH_ENV_VAR_NAME = 'EXH_CONFIG_FILE_PATH'
