import { exit } from 'process'

import { SITE_SERVER_OUTFILE } from '../../../common/paths'
import { buildServer } from '../buildServer'

const isRelease = process.env.EXH_RELEASE === '1'

buildServer({
  verbose: isRelease,
  sourceMap: true,
  incremental: !isRelease,
  minify: isRelease,
  outfile: SITE_SERVER_OUTFILE,
}).then(() => exit(0)).catch(() => exit(1))
