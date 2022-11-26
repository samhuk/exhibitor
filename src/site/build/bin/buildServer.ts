import path from 'path'
import { exit } from 'process'

import { SITE_SERVER_OUTDIR } from '../../../common/paths'
import { buildServer } from '../buildServer'

const isRelease = process.env.EXH_RELEASE === '1'

buildServer({
  verbose: isRelease,
  sourceMap: true,
  incremental: !isRelease,
  minify: isRelease,
  outfile: path.join(SITE_SERVER_OUTDIR, 'index.js'),
}).then(() => exit(0)).catch(() => exit(1))
