import {
  PLAYWRIGHT_HTML_REPORTER_CODE_CLONE_DIR,
  SITE_CLIENT_DIR,
  SITE_CLIENT_OUTDIR,
  SITE_COMMON_DIR,
} from '../../../common/paths'
import { watchClient } from '../watchClient'

const isDev = process.env.EXH_DEV === 'true'

watchClient({
  verbose: isDev,
  sourceMap: isDev,
  gzip: !isDev,
  incremental: isDev,
  minify: !isDev,
  outDir: SITE_CLIENT_OUTDIR,
  watchedDirPatterns: [SITE_CLIENT_DIR, SITE_COMMON_DIR, PLAYWRIGHT_HTML_REPORTER_CODE_CLONE_DIR, './src/common'],
})
