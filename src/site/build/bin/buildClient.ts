import { exit } from 'process'

import { SITE_CLIENT_OUTDIR } from '../../../common/paths'
import { buildClient } from '../buildClient'

const isRelease = process.env.EXH_RELEASE === '1'

buildClient({
  verbose: isRelease,
  sourceMap: true,
  gzip: isRelease,
  incremental: !isRelease,
  minify: isRelease,
  outDir: SITE_CLIENT_OUTDIR,
}).then(() => exit(0)).catch(() => exit(1))
