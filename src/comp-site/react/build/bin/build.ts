import { exit } from 'process'

import { build } from '../build'

const isDev = process.env.EXH_DEV === 'true'

build({
  verbose: isDev,
  sourceMap: isDev,
  gzip: !isDev,
  incremental: false,
  skipPrebuild: false,
}).then(() => exit(0)).catch(() => exit(1))
