import { ExhEnv, getEnv } from '../../../common/env'
import { SITE_COMMON_DIR, SITE_SERVER_DIR, SITE_SERVER_OUTFILE } from '../../../common/paths'
import { createBuiltExhIdentityClient } from '../../../intercom/client'
import { BuiltExhIdentity } from '../../../intercom/types'
import { watchServer } from '../watchServer'

const isDev = getEnv() === ExhEnv.DEV

const main = () => {
  const intercomClient = createBuiltExhIdentityClient(BuiltExhIdentity.SITE_SERVER)

  watchServer({
    verbose: isDev,
    sourceMap: isDev,
    incremental: isDev,
    minify: !isDev,
    outfile: SITE_SERVER_OUTFILE,
    watchedDirPatterns: [SITE_SERVER_DIR, SITE_COMMON_DIR, './src/common'],
    serverHost: process.env.EXH_SITE_SERVER_HOST ?? 'localhost',
    serverPort: process.env.EXH_SITE_SERVER_PORT != null ? parseInt(process.env.EXH_SITE_SERVER_PORT) : null,
    buildStatusReporter: intercomClient.buildStatusReporter,
  })
}

main()
