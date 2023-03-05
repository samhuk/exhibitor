import { CONFIG_FILE_PATH_ENV_VAR_NAME, getConfig } from '../../common/config'
import { Config } from '../../common/config/types'
import { logStep } from '../../common/logging'
import state from '../../common/state'

// eslint-disable-next-line import/no-mutable-exports
export let config: Config = null

export const loadConfig = async () => {
  logStep(`Site Server is loading config from ${process.env[CONFIG_FILE_PATH_ENV_VAR_NAME]}`, true)
  config = await getConfig(process.env[CONFIG_FILE_PATH_ENV_VAR_NAME])
  // If verbose mode has not already been enabled, refer to the value from config
  if (!state.verbose)
    state.verbose = config.verbose
}
