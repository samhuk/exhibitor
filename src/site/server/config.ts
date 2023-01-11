import { CONFIG_FILE_PATH_ENV_VAR_NAME } from '../../common/config'
import { resolveConfig } from '../../cli/config'
import { readAndParseConfig } from '../../cli/config/read'
import { Config, ResolvedConfig } from '../../cli/config/types'

const getConfig = async () => {
  const configFilePath = process.env[CONFIG_FILE_PATH_ENV_VAR_NAME]

  let config: Config = null
  if (configFilePath != null)
    config = await readAndParseConfig(configFilePath)

  return resolveConfig(config, configFilePath)
}

// eslint-disable-next-line import/no-mutable-exports
export let config: ResolvedConfig = null

const main = async () => {
  config = await getConfig()
}

main()
