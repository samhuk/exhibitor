import { exit } from 'process'

import { SITE_SERVER_OUTFILE } from '../../../common/paths'
import { buildServer } from '../buildServer'

const isDev = process.env.EXH_DEV === 'true'

buildServer({
  verbose: isDev,
  sourceMap: isDev,
  incremental: isDev,
  minify: !isDev,
  outfile: SITE_SERVER_OUTFILE,
}).then(() => exit(0)).catch(() => exit(1))
