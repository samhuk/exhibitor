import { exit } from 'process'
import { COMPONENT_SITE_CLIENT_OUTDIR } from '../../../common/paths'

import { build } from '../build'

const isRelease = process.env.EXH_RELEASE === '1'

build({
  verbose: isRelease,
  sourceMap: true,
  gzip: isRelease,
  incremental: !isRelease,
  minify: isRelease,
  outDir: COMPONENT_SITE_CLIENT_OUTDIR,
}).then(() => exit(0)).catch(() => exit(1))
