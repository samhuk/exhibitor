import { createNodeStoreClient } from 'sock-state/lib/client/node'
import { BUILD_STATUSES_TOPIC, DEFAULT_INTERCOM_PORT, INTERCOM_PORT_ENV_VAR_NAME } from '../../../intercom/common'
import { BuiltExhIdentity } from '../../../intercom/types'
import {
  PLAYWRIGHT_HTML_REPORTER_CODE_CLONE_DIR,
  SITE_CLIENT_DIR,
  SITE_CLIENT_OUTDIR,
  SITE_COMMON_DIR,
} from '../../../common/paths'
import { watchClient } from '../watchClient'
import { ExhEnv, getEnv } from '../../../common/env'
import { createBuiltExhIdentityClient } from '../../../intercom/client'

const isDev = getEnv() === ExhEnv.DEV

const main = () => {
  const intercomClient = createBuiltExhIdentityClient(BuiltExhIdentity.SITE_CLIENT)

  watchClient({
    verbose: isDev,
    sourceMap: isDev,
    gzip: !isDev,
    incremental: isDev,
    minify: !isDev,
    outDir: SITE_CLIENT_OUTDIR,
    watchedDirPatterns: [SITE_CLIENT_DIR, SITE_COMMON_DIR, PLAYWRIGHT_HTML_REPORTER_CODE_CLONE_DIR, './src/common'],
    buildStatusReporter: intercomClient.buildStatusReporter,
  })
}

main()
