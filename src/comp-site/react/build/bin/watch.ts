import WebSocket from 'ws'
import { getConfig } from '../../../../common/config'
import { DEFAULT_CONFIG_FILE_NAME, TEST_COMPONENT_LIBRARY_ROOT_DIR } from '../../../../common/paths'
import { watchCompSite } from '../watch'
import { createOnIndexExhTsFileCreateHandler } from '../../../../cli/commands/start'
import { createIntercomClient } from '../../../../common/intercom/client'
import { IntercomIdentityType, IntercomMessageType } from '../../../../common/intercom/types'
import { logIntercomInfo } from '../../../../common/logging'
import { DEFAULT_INTERCOM_PORT, INTERCOM_PORT_ENV_VAR_NAME } from '../../../../common/intercom'

const TEST_COMPONENT_LIBRARY_EXH_CONFIG_FILE = `${TEST_COMPONENT_LIBRARY_ROOT_DIR}/${DEFAULT_CONFIG_FILE_NAME}` as const

const main = async () => {
  const config = await getConfig(TEST_COMPONENT_LIBRARY_EXH_CONFIG_FILE)

  const intercomClient = createIntercomClient({
    host: process.env.EXH_SITE_SERVER_HOST,
    port: process.env[INTERCOM_PORT_ENV_VAR_NAME] != null ? parseInt(process.env[INTERCOM_PORT_ENV_VAR_NAME]) : DEFAULT_INTERCOM_PORT,
    identityType: IntercomIdentityType.COMP_LIB_WATCH,
    webSocketCreator: url => new WebSocket(url) as any,
  })

  await intercomClient.connect()

  watchCompSite({
    skipPrebuild: true,
    config,
    reactMajorVersion: 18,
    onIndexExhTsFileCreate: createOnIndexExhTsFileCreateHandler(config, { host: intercomClient.host, port: intercomClient.port }),
    onSuccessfulBuildComplete: () => {
      logIntercomInfo('Sending build complete message to intercom.')
      intercomClient.send({
        to: IntercomIdentityType.SITE_CLIENT,
        type: IntercomMessageType.COMPONENT_LIBRARY_BUILD_COMPLETED,
      })
    },
  })
}

main()
