import { SITE_CLIENT_DIR, SITE_CLIENT_OUTDIR, SITE_COMMON_DIR } from '../../../common/paths'
import { watchClient } from '../watchClient'

const isRelease = process.env.EXH_RELEASE === '1'

watchClient({
  verbose: isRelease,
  sourceMap: true,
  gzip: isRelease,
  incremental: !isRelease,
  minify: isRelease,
  outDir: SITE_CLIENT_OUTDIR,
  watchedDirPatterns: [SITE_CLIENT_DIR, SITE_COMMON_DIR],
})
