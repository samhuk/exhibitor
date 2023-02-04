import { exit } from 'process'

import { ExhEnv, getEnv } from '../../../common/env'
import { SITE_SERVER_OUTFILE } from '../../../common/paths'
import { buildServer } from '../buildServer'

const isDev = getEnv() === ExhEnv.DEV

buildServer({
  verbose: isDev,
  sourceMap: isDev,
  incremental: isDev,
  minify: !isDev,
  outfile: SITE_SERVER_OUTFILE,
}).then(() => exit(0)).catch(() => exit(1))
