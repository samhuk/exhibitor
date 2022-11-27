import { DEFAULT_CONFIG_FILE_NAME, TEST_COMPONENT_LIBRARY_ROOT_DIR } from '../../../common/paths'
import { getConfig } from '../../config'
import { watchComponentLibrary } from '../watch'

const TEST_COMPONENT_LIBRARY_EXH_CONFIG_FILE = `${TEST_COMPONENT_LIBRARY_ROOT_DIR}/${DEFAULT_CONFIG_FILE_NAME}` as const

watchComponentLibrary(getConfig(`${TEST_COMPONENT_LIBRARY_EXH_CONFIG_FILE}`), TEST_COMPONENT_LIBRARY_ROOT_DIR)
