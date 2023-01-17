import { ChildProcess } from 'child_process'
import { watchComponentLibrary } from '../../componentLibrary/watch'
import { getConfigForCommand } from '../../config'
import { baseCommand } from '../common'
import { startServer } from './startServer'
import { applyStartOptionsToConfig } from './config'
import { StartCliArgumentsOptions } from './types'
import { build as buildCompSiteReact } from '../../../comp-site/react/build/build'
import { updateProcessVerbosity } from '../../state'
import { logStep, logWarn } from '../../logging'
import { CliError } from '../../types'
import { NPM_PACKAGE_CAPITALIZED_NAME } from '../../../common/name'
import { checkPackages, createCheckPackagesError, StartCommandCheckPackagesResult } from './checkPackages'
import { CheckPackageResultType } from '../../../common/npm/checkPackages'
import { Config } from '../../../common/config/types'
import { setMetadata } from '../../../common/metadata'
import { tryResolve } from '../../../common/npm/resolve'

const isDev = process.env.EXH_DEV === 'true'

const _watchComponentLibrary = async (
  config: Config,
): Promise<void> => new Promise<void>(res => {
  watchComponentLibrary(config, res)
})

const extractReactMajorVersionNumber = (results: StartCommandCheckPackagesResult): number | null => {
  const result = results.results.react
  if (result == null)
    return null

  if (result.type !== CheckPackageResultType.SUCCESS)
    return null

  logStep(c => `Determining the major version number of the installed React (from ${c.cyan(`'${result.version}'`)}).`, true)

  return result.semVer.major
}

const logMajorReactVersion = (reactMajorVersion: number | null) => {
  if (reactMajorVersion == null || Number.isNaN(reactMajorVersion)) {
    // eslint-disable-next-line max-len
    logWarn('Could not determine the React major version number. Will use Component Site for React versions >=18.\n\nIf you know what you are doing, then this can be ignored, but this is an indication of a non-standard setup.')
  }
  else if (reactMajorVersion >= 18) {
    logStep(c => `React major version is at or above version 18 (${c.cyan(reactMajorVersion.toString())}). Using Component Site for React versions >=18.`, true)
  }
  else if (reactMajorVersion < 18) {
    logStep(c => `React major version is earlier than version 18 (${c.cyan(reactMajorVersion.toString())}). Using Component Site for React versions <18.`, true)
  }
}

export const start = baseCommand('start', async (startOptions: StartCliArgumentsOptions): Promise<CliError> => {
  // If verbose is specified in CLI arguments, then we can globally set it earlier
  if (startOptions.verbose != null)
    updateProcessVerbosity(startOptions.verbose)

  // -- Config
  const result = await getConfigForCommand(startOptions, applyStartOptionsToConfig)
  if (result.success === false)
    return result.error

  updateProcessVerbosity(result.config.verbose)
  const config = result.config // Convenient alias

  // -- Logic
  // Check packages required to build the Component Site for React, getting version numbers
  const results = checkPackages()
  if (results.hasErrors === true)
    return createCheckPackagesError(results.error.errorMsg, results.error.name)

  const reactMajorVersionNumber = extractReactMajorVersionNumber(results)
  logMajorReactVersion(reactMajorVersionNumber)

  try {
    // Build Component Site, waiting for first build
    // In dev, we will build it straight from the local Typescript to final bundle
    await buildCompSiteReact({
      gzip: !isDev,
      sourceMap: isDev,
      verbose: config.verbose,
      skipPrebuild: isDev,
      reactMajorVersion: reactMajorVersionNumber,
      config,
      onIndexExhTsFileCreate: file => {
        logStep('Creating metadata.json file', true)
        setMetadata({
          includedFilePaths: file.includedFilePaths,
          siteTitle: config.site.title,
          isAxeEnabled: tryResolve('axe-core').success === true,
        })
      },
    })
  }
  catch (e: any) {
    return {
      message: `Failed to start ${NPM_PACKAGE_CAPITALIZED_NAME}. Could not build the Component Site for React.\n\n    This could be because you have a version of React that isn't supported. Otherwise, you may have some custom npm setup that ${NPM_PACKAGE_CAPITALIZED_NAME} can't handle.`,
      causedBy: e,
    }
  }

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
    // ctrl-c (end of text)
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
