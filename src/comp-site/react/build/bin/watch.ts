import WebSocket from 'ws'
import { getConfig } from '../../../../common/config'
import { DEFAULT_CONFIG_FILE_NAME, TEST_COMPONENT_LIBRARY_ROOT_DIR } from '../../../../common/paths'
import { watchCompSite } from '../watch'
import { createOnIndexExhTsFileCreateHandler } from '../../../../cli/commands/start'
import { createIntercomClient } from '../../../../common/intercom/client'
import { IntercomIdentityType, IntercomMessageType } from '../../../../common/intercom/types'
import { logIntercomInfo } from '../../../../common/logging'
import { updateProcessShowIntercomLog } from '../../../../common/state'

const TEST_COMPONENT_LIBRARY_EXH_CONFIG_FILE = `${TEST_COMPONENT_LIBRARY_ROOT_DIR}/${DEFAULT_CONFIG_FILE_NAME}` as const

const main = async () => {
  updateProcessShowIntercomLog(process.env.SHOW_INTERCOM_LOG === 'true')

  const config = await getConfig(TEST_COMPONENT_LIBRARY_EXH_CONFIG_FILE)

  const intercomClient = createIntercomClient({
    identityType: IntercomIdentityType.COMP_LIB_WATCH,
    webSocketCreator: url => new WebSocket(url) as any,
  })

  await intercomClient.connect()

  watchCompSite({
    skipPrebuild: true,
    config,
    reactMajorVersion: 18,
    onIndexExhTsFileCreate: createOnIndexExhTsFileCreateHandler(config),
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
