import { exit } from 'process'

import { buildCli } from '..'

buildCli().then(() => exit(0)).catch(() => exit(1))
