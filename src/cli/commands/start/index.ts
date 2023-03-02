import { ChildProcess } from 'child_process'
import { getConfigForCommand } from '../../config'
import { baseCommand } from '../common'
import { startServer } from './startServer'
import { applyStartOptionsToConfig } from './config'
import { StartCliArgumentsOptions } from './types'
import { watchCompSite } from '../../../comp-site/react/build/watch'
import state from '../../../common/state'
import { NPM_PACKAGE_CAPITALIZED_NAME } from '../../../common/name'
import { checkPackages } from './checkPackages'
import { setMetadata } from '../../../common/metadata'
import { tryResolve } from '../../../common/npm/resolve'
import { BuildOptions } from '../../../comp-site/react/build/types'
import { Config } from '../../../common/config/types'
import { logIntercomError, logIntercomStep, logIntercomSuccess, logStep, logStepHeader, logSuccess } from '../../../common/logging'
import { ExhError } from '../../../common/exhError/types'
import { createExhError, isExhError } from '../../../common/exhError'
import { findFreePort } from '../../common/isPortFree'
import { ExhEnv, getEnv } from '../../../common/env'
import { VERBOSE_ENV_VAR_NAME } from '../../../common/config'
import { DEFAULT_INTERCOM_PORT, INTERCOM_PORT_ENV_VAR_NAME } from '../../../intercom/common'
import { createBuiltExhIdentityClient } from '../../../intercom/client'
import { BuiltExhIdentity } from '../../../intercom/types'
import { startIntercomServer } from '../../../intercom/server'
import { NetworkLocation } from '../../../common/network'

const exhEnv = getEnv()
const isDev = exhEnv === ExhEnv.DEV

const watchCompSiteWaitForFirstSuccessfulBuild = async (
  options: BuildOptions,
): Promise<void> => new Promise<void>(res => {
  watchCompSite({
    ...options,
    onFirstSuccessfulBuild: res,
  })
})

export const createOnIndexExhTsFileCreateHandler = (
  config: Config,
  intercom: { host: string, port: number, enableLogging: boolean },
) => (file: { includedFilePaths: string[] }) => {
  logStep('Creating metadata.json file', true)
  setMetadata({
    includedFilePaths: file.includedFilePaths,
    siteTitle: config.site.title,
    isAxeEnabled: tryResolve('axe-core').success === true,
    env: exhEnv,
    intercom,
  })
}

const determineServerPort = async (config: Config): Promise<number | ExhError> => {
  let err: ExhError = null
  const port = await findFreePort({
    host: config.site.host,
    preferredPort: config.site.port,
    maxAttempts: 10,
    events: {
      onAttemptStart: p => logStep(c => `Determining if port ${c.cyan(p.toString())} is available to use for Exhibitor.`, true),
      onAttemptSuccess: p => logSuccess(c => `Port ${c.cyan(p.toString())} is available to use.`, true),
      onAttemptFail: p => createExhError({ message: c => `Port ${c.cyan(p.toString())} is not available to use.` }).log(),
      onAttemptUnexpectedError: (p, _err) => {
        err = createExhError({
          message: `Could not start ${NPM_PACKAGE_CAPITALIZED_NAME}`,
          // eslint-disable-next-line no-loop-func
          causedBy: c => `An unexpected error occured while determining whether port ${c.cyan(port.toString())} is available to use.\n\n    Details: ${_err}.`,
        })
        return { exit: true }
      },
      onMaxAttempts: () => createExhError({ message: 'Max attempts exceeded for finding an available port to use.' }).log(),
    },
  })
  if (err != null)
    return err

  return port
}

const determineIntercomPort = async (host: string, serverPort: number): Promise<number | ExhError> => {
  const portFromEnv = process.env[INTERCOM_PORT_ENV_VAR_NAME]
  const parsedPortFromEnv = portFromEnv != null ? parseInt(portFromEnv) : null
  if (parsedPortFromEnv != null && Number.isNaN(parsedPortFromEnv)) {
    return createExhError({
      message: `Could not start ${NPM_PACKAGE_CAPITALIZED_NAME}`,
      causedBy: c => `The ${c.bold(INTERCOM_PORT_ENV_VAR_NAME)} environment variable is present however not a valid integer. Recieved: ${c.cyan(portFromEnv)}`,
    })
  }

  let err: ExhError = null
  const port = await findFreePort({
    host,
    preferredPort: parsedPortFromEnv ?? DEFAULT_INTERCOM_PORT,
    exclusions: [serverPort], // Don't put Intercom on same port as Site Server
    maxAttempts: 10,
    events: {
      onAttemptStart: p => logIntercomStep(c => `Determining if port ${c.cyan(p.toString())} is available to use.`),
      onAttemptSuccess: p => logIntercomSuccess(c => `Port ${c.cyan(p.toString())} is available to use for Exhibitor Intercom.`),
      onAttemptFail: p => logIntercomError(c => `Port ${c.cyan(p.toString())} is not available to use for Exhibitor Intercom.`),
      onAttemptExcluded: p => logIntercomError(c => `Port ${c.cyan(p.toString())} is not available to use for Exhibitor Intercom because the ${NPM_PACKAGE_CAPITALIZED_NAME} Exhibitor Server is already using it.`),
      onAttemptUnexpectedError: (p, _err) => {
        err = createExhError({
          message: `Could not start ${NPM_PACKAGE_CAPITALIZED_NAME}`,
          // eslint-disable-next-line no-loop-func
          causedBy: c => `An unexpected error occured while determining whether port ${c.cyan(port.toString())} is available to use for Intercom.\n\n    Details: ${_err}.`,
        })
        return { exit: true }
      },
      onMaxAttempts: () => logIntercomError(c => `Max attempts exceeded for finding an available port to use. Try using the ${c.bold(INTERCOM_PORT_ENV_VAR_NAME)} environment variable to set a different preferred port.`),
    },
  })
  if (err != null)
    return err

  return port
}

export const start = baseCommand('start', async (startOptions: StartCliArgumentsOptions): Promise<ExhError> => {
  // -- Config
  // If verbose is specified in CLI arguments or env var, then we can globally set it earlier
  const earlyVerbose = startOptions.verbose != null
    ? startOptions.verbose
    : (process.env[VERBOSE_ENV_VAR_NAME] === 'true' ?? false)
  state.verbose = earlyVerbose

  // Get config for command
  logStepHeader('Determining supplied configuration.', true)
  const getConfigResult = await getConfigForCommand(startOptions, applyStartOptionsToConfig)
  if (isExhError(getConfigResult))
    return getConfigResult

  const config = getConfigResult // Convenient alias

  // Update global verbosity according to config
  state.verbose = config.verbose

  // -- Logic
  // Check packages required to build the Component Site for React, getting version numbers
  const checkPackagesResult = checkPackages()
  if (isExhError(checkPackagesResult))
    return checkPackagesResult

  // Determine server port
  const serverPort = await determineServerPort(config)
  if (isExhError(serverPort))
    return serverPort

  // Determine intercom port
  const intercomPort = await determineIntercomPort(config.site.host, serverPort)
  if (isExhError(intercomPort))
    return intercomPort

  // -- Start intercom
  const intercomNetworkLocation: NetworkLocation = {
    host: config.site.host,
    port: intercomPort,
  }

  const intercomServer = startIntercomServer({
    networkLocation: intercomNetworkLocation,
    isSiteAlreadyBuilt: true,
  })

  const compLibWatchIntercomClient = createBuiltExhIdentityClient(BuiltExhIdentity.COMP_LIB, {
    networkLocation: intercomNetworkLocation,
  })

  try {
    // Watch Component Site, waiting for first successful build
    await watchCompSiteWaitForFirstSuccessfulBuild({
      skipPrebuild: isDev,
      reactMajorVersion: checkPackagesResult.reactMajorVersion,
      config,
      onIndexExhTsFileCreate: createOnIndexExhTsFileCreateHandler(config, {
        host: intercomNetworkLocation.host,
        port: intercomNetworkLocation.port,
        enableLogging: process.env.EXH_SHOW_INTERCOM_LOG === 'true',
      }),
      buildStatusReporter: compLibWatchIntercomClient.buildStatusReporter,
    })
  }
  catch (e: any) {
    return createExhError({
      message: `Failed to start ${NPM_PACKAGE_CAPITALIZED_NAME}. Could not build the Component Site for React.\n\n    This could be because you have a version of React that isn't supported. Otherwise, you may have some custom npm setup that ${NPM_PACKAGE_CAPITALIZED_NAME} can't handle.`,
      causedBy: e,
    })
  }

  // Start the site server
  logStep(`Starting ${NPM_PACKAGE_CAPITALIZED_NAME}`)
  const startServerResult = await startServer({
    serverPort,
    intercomPort,
    config,
    // If the server dies, kill ourselves as well
    onServerProcessKill: () => process.exit(0),
  })

  // If start server result is not a child process, then it's an error, therefore return.
  if (!(startServerResult instanceof ChildProcess))
    return startServerResult

  return null
}, { exitWhenReturns: false })
