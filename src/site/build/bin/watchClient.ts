import WebSocket from 'ws'
import {
  PLAYWRIGHT_HTML_REPORTER_CODE_CLONE_DIR,
  SITE_CLIENT_DIR,
  SITE_CLIENT_OUTDIR,
  SITE_COMMON_DIR,
} from '../../../common/paths'
import { watchClient } from '../watchClient'
import { createIntercomClient } from '../../../common/intercom/client'
import { IntercomIdentityType, IntercomMessageType } from '../../../common/intercom/types'
import { logIntercomInfo } from '../../../common/logging'
import { DEFAULT_INTERCOM_PORT, INTERCOM_PORT_ENV_VAR_NAME } from '../../../common/intercom'

const isDev = process.env.EXH_DEV === 'true'

const main = async () => {
  const intercomClient = createIntercomClient({
    host: process.env.EXH_SITE_SERVER_HOST,
    port: process.env[INTERCOM_PORT_ENV_VAR_NAME] != null ? parseInt(process.env[INTERCOM_PORT_ENV_VAR_NAME]) : DEFAULT_INTERCOM_PORT,
    identityType: IntercomIdentityType.CLIENT_WATCH,
    webSocketCreator: url => new WebSocket(url) as any,
  })

  await intercomClient.connect()

  watchClient({
    verbose: isDev,
    sourceMap: isDev,
    gzip: !isDev,
    incremental: isDev,
    minify: !isDev,
    outDir: SITE_CLIENT_OUTDIR,
    watchedDirPatterns: [SITE_CLIENT_DIR, SITE_COMMON_DIR, PLAYWRIGHT_HTML_REPORTER_CODE_CLONE_DIR, './src/common'],
    onSuccessfulBuildComplete: () => {
      logIntercomInfo('Sending build complete message to intercom.')
      intercomClient.send({
        to: IntercomIdentityType.SITE_CLIENT,
        type: IntercomMessageType.SITE_CLIENT_BUILD_COMPLETED,
      })
    },
  })
}

main()
