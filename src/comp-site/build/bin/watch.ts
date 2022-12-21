import { COMPONENT_SITE_CLIENT_OUTDIR, COMPONENT_SITE_CLIENT_DIR } from '../../../common/paths'
import { watch } from '../watch'

const isRelease = process.env.EXH_RELEASE === '1'

watch({
  verbose: isRelease,
  sourceMap: true,
  gzip: isRelease,
  incremental: !isRelease,
  minify: isRelease,
  outDir: COMPONENT_SITE_CLIENT_OUTDIR,
  watchedDirPatterns: [COMPONENT_SITE_CLIENT_DIR],
})
