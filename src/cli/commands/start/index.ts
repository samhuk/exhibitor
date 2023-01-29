import { ChildProcess } from 'child_process'
import WebSocket from 'ws'
import { getConfigForCommand } from '../../config'
import { baseCommand } from '../common'
import { startServer } from './startServer'
import { applyStartOptionsToConfig } from './config'
import { StartCliArgumentsOptions } from './types'
import { watchCompSite } from '../../../comp-site/react/build/watch'
import { getProcessVerbosity, updateProcessVerbosity } from '../../../common/state'
import { isCliError, logStep, logStepHeader } from '../../logging'
import { CliError } from '../../types'
import { NPM_PACKAGE_CAPITALIZED_NAME } from '../../../common/name'
import { checkPackages } from './checkPackages'
import { setMetadata } from '../../../common/metadata'
import { tryResolve } from '../../../common/npm/resolve'
import { BuildOptions } from '../../../comp-site/react/build/types'
import { Config } from '../../../common/config/types'
import { createIntercomClient } from '../../../common/intercom/client'
import { IntercomIdentityType, IntercomMessageType } from '../../../common/intercom/types'
import { logIntercomInfo } from '../../../common/logging'

const isDev = process.env.EXH_DEV === 'true'

const watchCompSiteWaitForFirstSuccessfulBuild = async (
  options: BuildOptions,
): Promise<void> => new Promise<void>(res => {
  watchCompSite({ ...options, onFirstSuccessfulBuildComplete: res })
})

export const createOnIndexExhTsFileCreateHandler = (config: Config) => (file: { includedFilePaths: string[] }) => {
  logStep('Creating metadata.json file', true)
  setMetadata({
    includedFilePaths: file.includedFilePaths,
    siteTitle: config.site.title,
    isAxeEnabled: tryResolve('axe-core').success === true,
  })
}

export const start = baseCommand('start', async (startOptions: StartCliArgumentsOptions): Promise<CliError> => {
  // -- Config
  // If verbose is specified in CLI arguments, then we can globally set it earlier
  if (startOptions.verbose != null)
    updateProcessVerbosity(startOptions.verbose)
  // Get config for command
  if (getProcessVerbosity())
    logStepHeader('Determining supplied configuration.')
  else
    logStep('Determining supplied configuration.')
  const geConfigResult = await getConfigForCommand(startOptions, applyStartOptionsToConfig)
  if (geConfigResult.success === false)
    return geConfigResult.error

  const config = geConfigResult.config // Convenient alias

  // Update global verbosity according to config
  updateProcessVerbosity(config.verbose)

  // -- Logic
  // Check packages required to build the Component Site for React, getting version numbers
  const checkPackagesResult = checkPackages()
  if (isCliError(checkPackagesResult))
    return checkPackagesResult

  const intercomClient = createIntercomClient({
    identityType: IntercomIdentityType.CLI,
    webSocketCreator: url => new WebSocket(url) as any,
  })

  try {
    // Watch Component Site, waiting for first successful build
    await watchCompSiteWaitForFirstSuccessfulBuild({
      skipPrebuild: isDev,
      reactMajorVersion: checkPackagesResult.reactMajorVersion,
      config,
      onIndexExhTsFileCreate: createOnIndexExhTsFileCreateHandler(config),
      onSuccessfulBuildComplete: () => {
        logIntercomInfo('Sending build complete message to intercom.')
        intercomClient.send({
          to: IntercomIdentityType.SITE_CLIENT,
          type: IntercomMessageType.COMPONENT_LIBRARY_BUILD_COMPLETED,
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
  const startServerResult = await startServer({
    config,
    onServerProcessKill: () => process.exit(0),
  })

  await intercomClient.connect()

  // If start server result is not a child process, then it's an error, therefore return.
  if (!(startServerResult instanceof ChildProcess))
    return startServerResult

  return null
}, { exitWhenReturns: false })
