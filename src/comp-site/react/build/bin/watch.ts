import { getConfig } from '../../../../common/config'
import { DEFAULT_CONFIG_FILE_NAME, TEST_COMPONENT_LIBRARY_ROOT_DIR } from '../../../../common/paths'
import { watchCompSite } from '../watch'
import { createOnIndexExhTsFileCreateHandler } from '../../../../cli/commands/start'

const TEST_COMPONENT_LIBRARY_EXH_CONFIG_FILE = `${TEST_COMPONENT_LIBRARY_ROOT_DIR}/${DEFAULT_CONFIG_FILE_NAME}` as const

const main = async () => {
  const config = await getConfig(TEST_COMPONENT_LIBRARY_EXH_CONFIG_FILE)
  watchCompSite({
    skipPrebuild: true,
    config,
    reactMajorVersion: 18,
    onIndexExhTsFileCreate: createOnIndexExhTsFileCreateHandler(config),
  })
}

main()
