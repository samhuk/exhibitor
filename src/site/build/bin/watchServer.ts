import { SITE_COMMON_DIR, SITE_SERVER_DIR, SITE_SERVER_OUTFILE } from '../../../common/paths'
import { watchServer } from '../watchServer'

const isRelease = process.env.EXH_RELEASE === '1'

watchServer({
  verbose: isRelease,
  sourceMap: true,
  incremental: !isRelease,
  minify: isRelease,
  outfile: SITE_SERVER_OUTFILE,
  watchedDirPatterns: [SITE_SERVER_DIR, SITE_COMMON_DIR],
  serverHost: process.env.SITE_SERVER_HOST ?? 'localhost',
  serverPort: process.env.SITE_SERVER_PORT != null ? parseInt(process.env.SITE_SERVER_PORT) : null,
})
