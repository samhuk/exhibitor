import { DEFAULT_CONFIG_FILE_NAME, TEST_COMPONENT_LIBRARY_ROOT_DIR } from '../../../common/paths'
import { readAndParseConfig, resolveConfig } from '../../config'
import { watchComponentLibrary } from '../watch'

const TEST_COMPONENT_LIBRARY_EXH_CONFIG_FILE = `${TEST_COMPONENT_LIBRARY_ROOT_DIR}/${DEFAULT_CONFIG_FILE_NAME}` as const

const getWatchComponentLibaryDevConfig = () => {
  const config = readAndParseConfig(TEST_COMPONENT_LIBRARY_EXH_CONFIG_FILE)
  return resolveConfig(config, TEST_COMPONENT_LIBRARY_EXH_CONFIG_FILE)
}

watchComponentLibrary(getWatchComponentLibaryDevConfig())
