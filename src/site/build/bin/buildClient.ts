import { exit } from 'process'

import { ExhEnv, getEnv } from '../../../common/env'
import { SITE_CLIENT_OUTDIR } from '../../../common/paths'
import { buildClient } from '../buildClient'

const isDev = getEnv() === ExhEnv.DEV

buildClient({
  verbose: isDev,
  sourceMap: isDev,
  gzip: !isDev,
  incremental: isDev,
  minify: !isDev,
  outDir: SITE_CLIENT_OUTDIR,
}).then(() => exit(0)).catch(() => exit(1))
