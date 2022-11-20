import path from 'path'
import { exit } from 'process'
import { TEST_COMPONENT_LIBRARY_ROOT_DIR, DEFAULT_CONFIG_FILE_NAME } from '../common/paths'
import { getConfig } from './config'
import { start } from './start'

const _getConfig = () => {
  console.log('==> Getting config')
  const isTesting = process.env.IS_EXHIBITOR_TESTING === 'true'
  const configFilePath = isTesting
    // E.g. ./test/componentLibrary/config.exh.json
    ? path.join(TEST_COMPONENT_LIBRARY_ROOT_DIR, DEFAULT_CONFIG_FILE_NAME)
    : path.join('./', DEFAULT_CONFIG_FILE_NAME)
  return getConfig(configFilePath)
}

export const main = async () => {
  /* TODO: For now, we will just have one "command" - "run". Later on,
   * a proper CLI will be used to support multiple commands, arguments, etc.
   */

  const config = _getConfig()

  start(config)
}

main()
