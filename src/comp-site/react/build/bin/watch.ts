import WebSocket from 'ws'
import { getConfig } from '../../../../common/config'
import { DEFAULT_CONFIG_FILE_NAME, TEST_COMPONENT_LIBRARY_ROOT_DIR } from '../../../../common/paths'
import { watchCompSite } from '../watch'
import { createOnIndexExhTsFileCreateHandler } from '../../../../cli/commands/start'
import { createIntercomClient } from '../../../../common/intercom/client'
import { IntercomClient, IntercomIdentityType, IntercomMessageType } from '../../../../common/intercom/types'
import { DEFAULT_INTERCOM_PORT, INTERCOM_PORT_ENV_VAR_NAME } from '../../../../common/intercom'
import { BuildStatusReporter, BuildStatus, createBuildStatusReporter } from '../../../../common/building'

const TEST_COMPONENT_LIBRARY_EXH_CONFIG_FILE = `${TEST_COMPONENT_LIBRARY_ROOT_DIR}/${DEFAULT_CONFIG_FILE_NAME}` as const

const main = async () => {
  const config = await getConfig(TEST_COMPONENT_LIBRARY_EXH_CONFIG_FILE)

  let buildStatusReporter: BuildStatusReporter = null
  let intercomClient: IntercomClient = null

  const sendBuildStatusUpdateToIntercom = (status: BuildStatus, prevStatus: BuildStatus) => {
    intercomClient.send({
      type: IntercomMessageType.BUILD_STATUS_CHANGE,
      status,
      prevStatus,
    })
  }

  const sendCurrentBuildStatusUpdateToIntercom = () => {
    intercomClient.send({
      type: IntercomMessageType.BUILD_STATUS_CHANGE,
      status: buildStatusReporter.status,
      prevStatus: buildStatusReporter.status,
    })
  }

  intercomClient = createIntercomClient({
    host: process.env.EXH_SITE_SERVER_HOST,
    port: process.env[INTERCOM_PORT_ENV_VAR_NAME] != null ? parseInt(process.env[INTERCOM_PORT_ENV_VAR_NAME]) : DEFAULT_INTERCOM_PORT,
    identityType: IntercomIdentityType.COMP_LIB_WATCH,
    webSocketCreator: url => new WebSocket(url) as any,
    enableLogging: process.env.EXH_SHOW_INTERCOM_LOG === 'true',
    events: {
      onReconnect: () => {
        // When we reconnect to Intercom, send our status
        sendCurrentBuildStatusUpdateToIntercom()
      },
    },
  })

  buildStatusReporter = createBuildStatusReporter({
    onChange: sendBuildStatusUpdateToIntercom,
  })

  await intercomClient.connect()

  // When we first connect to Intercom, send our status
  sendCurrentBuildStatusUpdateToIntercom()

  watchCompSite({
    skipPrebuild: true,
    config,
    reactMajorVersion: 18,
    onIndexExhTsFileCreate: createOnIndexExhTsFileCreateHandler(config, {
      host: intercomClient.host,
      port: intercomClient.port,
      enableLogging: process.env.EXH_SHOW_INTERCOM_LOG === 'true',
    }),
    buildStatusReporter,
  })
}

main()
