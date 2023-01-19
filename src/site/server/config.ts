import { updateProcessVerbosity } from '../../cli/state'
import { CONFIG_FILE_PATH_ENV_VAR_NAME, getConfig } from '../../common/config'
import { Config } from '../../common/config/types'

// eslint-disable-next-line import/no-mutable-exports
export let config: Config = null

const main = async () => {
  config = await getConfig(process.env[CONFIG_FILE_PATH_ENV_VAR_NAME])

  updateProcessVerbosity(config.verbose)
}

main()
