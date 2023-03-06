import { CONFIG_FILE_PATH_ENV_VAR_NAME, getConfig } from '../../common/config'
import { Config } from '../../common/config/types'
import { logStep } from '../../common/logging'
import state from '../../common/state'

// eslint-disable-next-line import/no-mutable-exports
export let config: Config = null

export const loadConfig = async () => {
  const configFilePath = process.env[CONFIG_FILE_PATH_ENV_VAR_NAME]
  if (configFilePath != null)
    logStep(`Site Server is loading config from ${configFilePath}`, true)
  else
    logStep('Site Server is loading default config as no config file path has been provided.', true)
  config = await getConfig(configFilePath)
  // If verbose mode has not already been enabled, refer to the value from config
  if (!state.verbose)
    state.verbose = config.verbose
}
