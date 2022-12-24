import { COMP_SITE_OUTDIR, COMP_SITE_REACT_DIR } from '../../../../common/paths'
import { watch } from '../watch'

const isRelease = process.env.EXH_RELEASE === '1'

watch({
  verbose: isRelease,
  sourceMap: true,
  gzip: isRelease,
  incremental: !isRelease,
  minify: isRelease,
  outDir: COMP_SITE_OUTDIR,
  watchedDirPatterns: [COMP_SITE_REACT_DIR],
})
