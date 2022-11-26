import path from 'path'

import { SITE_COMMON_DIR, SITE_SERVER_DIR, SITE_SERVER_OUTDIR } from '../../../common/paths'
import { watchServer } from '../watchServer'

const isRelease = process.env.EXH_RELEASE === '1'

watchServer({
  verbose: isRelease,
  sourceMap: true,
  incremental: !isRelease,
  minify: isRelease,
  outfile: path.join(SITE_SERVER_OUTDIR, 'index.js'),
  watchedDirPatterns: [SITE_SERVER_DIR, SITE_COMMON_DIR],
  serverHost: process.env.SITE_SERVER_HOST ?? 'localhost',
  serverPort: process.env.SITE_SERVER_PORT != null ? parseInt(process.env.SITE_SERVER_PORT) : null,
})
