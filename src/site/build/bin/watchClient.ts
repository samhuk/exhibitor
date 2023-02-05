import WebSocket from 'ws'
import {
  PLAYWRIGHT_HTML_REPORTER_CODE_CLONE_DIR,
  SITE_CLIENT_DIR,
  SITE_CLIENT_OUTDIR,
  SITE_COMMON_DIR,
} from '../../../common/paths'
import { watchClient } from '../watchClient'
import { BuildStatus, BuildStatusReporter, createBuildStatusReporter } from '../../../common/building'
import { ExhEnv, getEnv } from '../../../common/env'
import { IntercomClient } from '../../../intercom/client/types'
import { createNodeIntercomClient } from '../../../intercom/client/node'
import { IntercomMessageType } from '../../../intercom/message/types'
import { IntercomIdentityType } from '../../../intercom/types'
import { DEFAULT_INTERCOM_PORT, INTERCOM_PORT_ENV_VAR_NAME } from '../../../intercom'

const isDev = getEnv() === ExhEnv.DEV

const main = async () => {
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

  intercomClient = createNodeIntercomClient({
    host: process.env.EXH_SITE_SERVER_HOST,
    port: process.env[INTERCOM_PORT_ENV_VAR_NAME] != null ? parseInt(process.env[INTERCOM_PORT_ENV_VAR_NAME]) : DEFAULT_INTERCOM_PORT,
    identityType: IntercomIdentityType.CLIENT_WATCH,
    enableLogging: process.env.EXH_SHOW_INTERCOM_LOG === 'true',
    events: {
      onReconnect: () => {
        // When we reconnect to Intercom, send our status
        sendBuildStatusUpdateToIntercom(buildStatusReporter.status, buildStatusReporter.status)
      },
    },
  })

  buildStatusReporter = createBuildStatusReporter({
    onChange: sendBuildStatusUpdateToIntercom,
  })

  await intercomClient.connect()

  // When we first connect to Intercom, send our status
  sendCurrentBuildStatusUpdateToIntercom()

  watchClient({
    verbose: isDev,
    sourceMap: isDev,
    gzip: !isDev,
    incremental: isDev,
    minify: !isDev,
    outDir: SITE_CLIENT_OUTDIR,
    watchedDirPatterns: [SITE_CLIENT_DIR, SITE_COMMON_DIR, PLAYWRIGHT_HTML_REPORTER_CODE_CLONE_DIR, './src/common'],
    buildStatusReporter,
  })
}

main()
