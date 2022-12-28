import { ChildProcess } from 'child_process'
import path from 'path'
import * as fs from 'fs'
import { watchComponentLibrary } from '../../componentLibrary/watch'
import { ResolvedConfig } from '../../config/types'
import { getConfigForCommand } from '../../config'
import { baseCommand } from '../common'
import { startServer } from './startServer'
import { applyStartOptionsToConfig } from './config'
import { StartCliArgumentsOptions } from './types'
import { build as buildCompSiteReact } from '../../../comp-site/react/build/build'
import state from '../../state'
import { logStep, logWarn } from '../../logging'
import { CliError, CliString } from '../../types'

const isDev = process.env.EXH_DEV === 'true'

const _watchComponentLibrary = async (
  config: ResolvedConfig,
): Promise<void> => new Promise<void>((res, rej) => {
  watchComponentLibrary(config, res)
})

const resolvePackagePath = (packageName: string) => {
  try {
    return require.resolve(packageName)
  }
  catch (e) {
    return null
  }
}

const createCheckPackagesError = (causedBy: CliString): CliError => ({
  message: 'Failed to start Exhibitor. Packages check failed.',
  causedBy,
})

const checkPackage = (packageName: string): CliError => {
  const packagePath = resolvePackagePath(packageName)
  if (packagePath == null)
    return createCheckPackagesError(c => `Package ${c.underline(packageName)} is missing. Have you tried running ${c.bold('npm i -S react')}?`)

  const packageJsonFilePath = path.join(
    path.dirname(packagePath),
    'package.json',
  )

  if (!fs.existsSync(packageJsonFilePath)) {
    logWarn(c => `Could not determine the version of ${c.underline(packageName)} being used because the package.json file for it does not exist at: ${c.cyan(packageJsonFilePath)}.

If you know what you are doing, then this can be ignored, but this is an indication of a non-standard setup.`)
  }

  try {
    const packageJsonString = fs.readFileSync(packageJsonFilePath, { encoding: 'utf8' })
    const packageJsonObj = JSON.parse(packageJsonString)
    const version = packageJsonObj.version

    logStep(c => `Using ${c.underline(packageName)} (v${version}) from ${c.cyan(packagePath)}`, true)
  }
  catch (e) {
    logWarn(c => `Could not determine the version of ${c.underline(packageName)} being used because the package.json file could not be read or parsed (${c.cyan(packageJsonFilePath)}).

    If you know what you are doing, then this can be ignored, but this is an indication of a non-standard setup. Specific error:\n${e}`)
  }

  return null
}

const checkPackages = (packages: string[]): CliError | null => {
  for (let i = 0; i < packages.length; i += 1) {
    const error = checkPackage(packages[i])
    if (error != null)
      return error
  }
  return null
}

export const start = baseCommand('start', async (startOptions: StartCliArgumentsOptions): Promise<CliError> => {
  // -- Config
  const result = getConfigForCommand(startOptions, applyStartOptionsToConfig)
  if (result.success === false)
    return result.error

  state.verbose = result.config.verbose

  const config = result.config // Alias

  // -- Logic
  // Check packages required to build the components site (React)
  const error = checkPackages(['react', 'react-dom'])
  if (error != null)
    return error
  // Build component site (React)
  await buildCompSiteReact({ gzip: !isDev, incremental: false, sourceMap: isDev, verbose: config.verbose, skipPrebuild: false })

  // Wait for component library to get its first successful build
  await _watchComponentLibrary(config)

  // Start the site server
  logStep('Starting Exhibitor')
  const startServerResult = await startServer(config)
  // If start server result is not a child process, then it's an error, therefore return.
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
