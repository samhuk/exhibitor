import { BuiltExhIdentity } from '../../../../intercom/types'
import { getConfig } from '../../../../common/config'
import { DEFAULT_CONFIG_FILE_NAME, TEST_COMPONENT_LIBRARY_ROOT_DIR } from '../../../../common/paths'
import { watchCompSite } from '../watch'
import { createOnIndexExhTsFileCreateHandler } from '../../../../cli/commands/start'
import { createBuiltExhIdentityClient } from '../../../../intercom/client'

const TEST_COMPONENT_LIBRARY_EXH_CONFIG_FILE = `${TEST_COMPONENT_LIBRARY_ROOT_DIR}/${DEFAULT_CONFIG_FILE_NAME}` as const

const isIntercomLoggingEnabled = process.env.EXH_SHOW_INTERCOM_LOG === 'true'

const main = async () => {
  const config = await getConfig(TEST_COMPONENT_LIBRARY_EXH_CONFIG_FILE)

  const intercomClient = createBuiltExhIdentityClient(BuiltExhIdentity.COMP_LIB)

  watchCompSite({
    skipPrebuild: true,
    config,
    reactMajorVersion: 18,
    onIndexExhTsFileCreate: createOnIndexExhTsFileCreateHandler(config, {
      host: intercomClient.host,
      port: intercomClient.port,
      enableLogging: isIntercomLoggingEnabled,
    }),
    buildStatusReporter: intercomClient.buildStatusReporter,
    compSiteOutDir: './.exh/comp-site',
    indexExhOutDir: './.exh/comp-lib',
    serverRootDir: './.exh/client',
  })
}

main()
