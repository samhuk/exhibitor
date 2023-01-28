import { updateProcessVerbosity } from '../../cli/state'
import { CONFIG_FILE_PATH_ENV_VAR_NAME, getConfig } from '../../common/config'
import { Config } from '../../common/config/types'
import { logStep } from '../../common/logging'

// eslint-disable-next-line import/no-mutable-exports
export let config: Config = null

export const loadConfig = async () => {
  logStep(c => `Site Server is loading config from ${process.env[CONFIG_FILE_PATH_ENV_VAR_NAME]}`, true)
  config = await getConfig(process.env[CONFIG_FILE_PATH_ENV_VAR_NAME])
  updateProcessVerbosity(config.verbose)
}
