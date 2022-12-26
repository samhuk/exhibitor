import { exit } from 'process'

import { buildCompSiteReactBuild } from '..'

buildCompSiteReactBuild().then(() => exit(0)).catch(() => exit(1))
