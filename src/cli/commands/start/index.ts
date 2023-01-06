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
import { NPM_PACKAGE_CAPITALIZED_NAME } from '../../../common/name'

const isDev = process.env.EXH_DEV === 'true'

const _watchComponentLibrary = async (
  config: ResolvedConfig,
): Promise<void> => new Promise<void>(res => {
  watchComponentLibrary(config, res)
})

const resolvePackagePath = (packageName: string): string | Error => {
  try {
    return require.resolve(packageName)
  }
  catch (e: any) {
    return e
  }
}

const createCheckPackagesError = (causedBy: CliString, packageName: string): CliError => ({
  message: c => `Failed to start Exhibitor. Package check failed for ${c.underline(packageName)}.`,
  causedBy,
})

const isCliError = (value: any): value is CliError => (
  value?.message != null
)

/**
 * Checks that the given package is resolvable, and logs it's version if successfully
 * resolved (if verbose mode is enabled).
 */
const checkPackage = (packageName: string): { version: string, packagePath: string } | CliError => {
  const packagePath = resolvePackagePath(packageName)
  if (typeof packagePath !== 'string') {
    return createCheckPackagesError(c => `Package ${c.underline(packageName)} could not be resolved. Is it installed (if not, try ${c.bold(`npm i -S ${packageName}`)})?. Else, this could be an issue with the package.json file of the package.
    
    Specific details: ${packagePath}`, packageName)
  }

  const packageJsonFilePath = path.join(
    path.dirname(packagePath),
    'package.json',
  )

  if (!fs.existsSync(packageJsonFilePath))
    logWarn(c => `Could not determine the version of ${c.underline(packageName)} being used because the package.json file for it does not exist at: ${c.cyan(packageJsonFilePath)}. If you know what you are doing, then this can be ignored, but this is an indication of a non-standard setup.`)

  try {
    const packageJsonString = fs.readFileSync(packageJsonFilePath, { encoding: 'utf8' })
    const packageJsonObj = JSON.parse(packageJsonString)
    const version = packageJsonObj.version

    logStep(c => `Using ${c.underline(packageName)} (v${version}) from ${c.cyan(packagePath)}`, true)

    return { version, packagePath }
  }
  catch (e) {
    logWarn(c => `Could not determine the version of ${c.underline(packageName)} being used because the package.json file could not be read or parsed (${c.cyan(packageJsonFilePath)}).

If you know what you are doing, then this can be ignored, but this is an indication of a non-standard setup. Specific error:\n${e}`)
  }

  return null
}

const checkPackages = (packages: string[]): { version: string, packagePath: string }[] | CliError => {
  const results: { version: string, packagePath: string }[] = []
  for (let i = 0; i < packages.length; i += 1) {
    const result = checkPackage(packages[i])
    if (isCliError(result))
      return result

    results.push(result)
  }
  return results
}

const extractReactMajorVersionNumber = (results: { version: string, packagePath: string }[]): number | null => {
  const reactVersion = results?.[0]?.version
  if (reactVersion == null)
    return null

  const reactMajorVersionString = reactVersion.substring(0, reactVersion.indexOf('.'))

  if (reactMajorVersionString.length === 0)
    return null

  const reactMajorVersionNumber = parseInt(reactMajorVersionString)
  if (Number.isNaN(reactMajorVersionNumber))
    return null

  return reactMajorVersionNumber
}

export const start = baseCommand('start', async (startOptions: StartCliArgumentsOptions): Promise<CliError> => {
  // If verbose is specified in CLI arguments, then we can globally set it earlier
  if (startOptions.verbose)
    state.verbose = true

  // -- Config
  const result = await getConfigForCommand(startOptions, applyStartOptionsToConfig)
  if (result.success === false)
    return result.error

  state.verbose = result.config.verbose

  const config = result.config // Alias

  // -- Logic
  // Check packages required to build the components site (React)
  const results = checkPackages(['react', 'react-dom'])
  if (isCliError(results))
    return results

  logStep(c => `Determining the major version number of the installed React (from ${c.cyan(`'${results?.[0]?.version}'`)}).`, true)
  const reactMajorVersionNumber = extractReactMajorVersionNumber(results)

  if (reactMajorVersionNumber == null) {
    logWarn(`Could not determine the React major version number. Will use Component Site for 18.x React.

If you know what you are doing, then this can be ignored, but this is an indication of a non-standard setup.`)
  }

  if (reactMajorVersionNumber < 18)
    logStep(c => `React major version is earlier than version 18 (using ${c.cyan(reactMajorVersionNumber.toString())}). Using Component Site for <18.x React.`, true)

  try {
    // Build component site (React)
    // In dev, we will build it from the local Typescript straight to bundle
    await buildCompSiteReact({
      gzip: !isDev,
      incremental: false,
      sourceMap: isDev,
      verbose: config.verbose,
      skipPrebuild: isDev,
      reactMajorVersion: reactMajorVersionNumber,
    })
  }
  catch (e: any) {
    return {
      message: `Failed to start ${NPM_PACKAGE_CAPITALIZED_NAME}. Could not build the Component Site for React.
      
This could be because you have a version of React that isn't supported. Otherwise, you may have some custom npm setup that ${NPM_PACKAGE_CAPITALIZED_NAME} can't handle.`,
      causedBy: e,
    }
  }

  // Wait for component library to get its first successful build
  await _watchComponentLibrary(config)

  // Start the site server
  logStep(`Starting ${NPM_PACKAGE_CAPITALIZED_NAME}`)
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
      logStep(`Stopping ${NPM_PACKAGE_CAPITALIZED_NAME}`)
      siteServerChildProcess.kill()
      process.exit(0)
    }

    // write the key to stdout all normal like
    process.stdout.write(key)
  })
  return null
}, { exitWhenReturns: false })
