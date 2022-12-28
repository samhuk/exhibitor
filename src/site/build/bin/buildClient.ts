import { exit } from 'process'

import { SITE_CLIENT_OUTDIR } from '../../../common/paths'
import { buildClient } from '../buildClient'

const isDev = process.env.EXH_DEV === 'true'

buildClient({
  verbose: isDev,
  sourceMap: isDev,
  gzip: !isDev,
  incremental: isDev,
  minify: !isDev,
  outDir: SITE_CLIENT_OUTDIR,
}).then(() => exit(0)).catch(() => exit(1))
