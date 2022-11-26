import { TEST_COMPONENT_LIBRARY_ROOT_DIR } from '../../../common/paths'
import { getConfig } from '../../config'
import { watchComponentLibrary } from '../watch'

watchComponentLibrary(getConfig(), TEST_COMPONENT_LIBRARY_ROOT_DIR)
