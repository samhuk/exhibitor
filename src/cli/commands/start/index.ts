import { ChildProcess } from 'child_process'
import { watchComponentLibrary } from '../../componentLibrary/watch'
import { ResolvedConfig } from '../../config/types'
import { getConfigForCommand } from '../../config'
import { baseCommand } from '../common'
import { startServer } from './startServer'
import { applyStartOptionsToConfig } from './config'
import { StartCliArgumentsOptions } from './types'
import { createWatchOptions } from '../../../comp-site/react/build/watch'
import { build as buildCompSiteReact } from '../../../comp-site/react/build/build'
import state from '../../state'
import { logStep } from '../../logging'

const _watchComponentLibrary = async (
  config: ResolvedConfig,
): Promise<void> => new Promise<void>((res, rej) => {
  watchComponentLibrary(config, res)
})

export const start = baseCommand('start', async (startOptions: StartCliArgumentsOptions) => {
  // -- Config
  const result = getConfigForCommand(startOptions, applyStartOptionsToConfig)
  if (result.success === false)
    return result.error

  state.verbose = result.config.verbose

  const config = result.config // Alias

  // -- Logic
  // Build component site (React)
  logStep('Building component site (React)')
  await buildCompSiteReact({ ...createWatchOptions(), verbose: config.verbose })

  // Wait for component library to get its first successful build
  logStep('Building component library')
  await _watchComponentLibrary(config)

  // Start the site server
  logStep('Starting Exhibitor')
  const startServerResult = await startServer(config)
  if (!(startServerResult instanceof ChildProcess))
    return startServerResult

  const siteServerChildProcess = startServerResult as ChildProcess

  process.stdin.setRawMode(true)
  process.stdin.setEncoding('utf8')
  process.stdin.on('data', key => {
    // ctrl-c ( end of text )
    // @ts-ignore
    if (key === '\u0003') {
      logStep('Stopping Exhibitor')
      siteServerChildProcess.kill()
      process.exit(0)
    }

    // write the key to stdout all normal like
    process.stdout.write(key)
  })
  return null
}, { exitWhenReturns: false })
