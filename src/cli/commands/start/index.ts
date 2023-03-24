import { ChildProcess } from 'child_process'
import * as fs from 'fs'
import path from 'path'
import { createGFError, GFError, GFResult } from 'good-flow'

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
import { findFreePort } from '../../common/isPortFree'
import { ExhEnv, getEnv } from '../../../common/env'
import { VERBOSE_ENV_VAR_NAME } from '../../../common/config'
import { DEFAULT_INTERCOM_PORT, INTERCOM_PORT_ENV_VAR_NAME } from '../../../intercom/common'
import { createBuiltExhIdentityClient } from '../../../intercom/client'
import { BuiltExhIdentity } from '../../../intercom/types'
import { startIntercomServer } from '../../../intercom/server'
import { NetworkLocation } from '../../../common/network'
import { META_DATA_FILE } from '../../../common/paths'

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
  intercom?: { host: string, port: number, enableLogging: boolean },
  isDemoMode?: boolean,
  metaDataWritePath?: string,
) => {
  const _metaDataWritePath = metaDataWritePath ?? META_DATA_FILE
  logStep(c => `Ensuring metadata.json file directory exists. Recieved: ${c.cyan(_metaDataWritePath)}. Attempting: ${c.cyan(path.resolve(_metaDataWritePath))}`, true)
  if (_metaDataWritePath != null && !fs.existsSync(_metaDataWritePath))
    fs.mkdirSync(path.dirname(_metaDataWritePath), { recursive: true })

  return (file: { includedFilePaths: string[] }) => {
    logStep(c => `Creating metadata.json file. Writing to ${c.cyan(_metaDataWritePath)}.`, true)
    setMetadata({
      includedFilePaths: file.includedFilePaths,
      siteTitle: config.site.title,
      isAxeEnabled: tryResolve('axe-core').success === true,
      env: exhEnv,
      isDemoMode,
      intercom,
    }, _metaDataWritePath)
  }
}

const determineServerPort = async (config: Config): Promise<GFResult<number>> => {
  let err: GFError = null
  const port = await findFreePort({
    host: config.site.host,
    preferredPort: config.site.port,
    maxAttempts: 10,
    events: {
      onAttemptStart: p => logStep(c => `Determining if port ${c.cyan(p.toString())} is available to use for ${NPM_PACKAGE_CAPITALIZED_NAME}.`, true),
      onAttemptSuccess: p => logSuccess(c => `Port ${c.cyan(p.toString())} is available to use.`, true),
      onAttemptFail: p => createGFError({ msg: c => `Port ${c.cyan(p.toString())} is not available to use.` }).log(),
      onAttemptUnexpectedError: (p, _err) => {
        err = createGFError({
          msg: c => `An unexpected error occured while determining whether port ${c.cyan(port.toString())} is available to use.\n\n    Details: ${_err}.`,
        })
        return { exit: true }
      },
      onMaxAttempts: () => {
        err = createGFError({ msg: 'Max attempts exceeded for finding an available port to use.' })
      },
    },
  })

  return [port, err]
}

const determineIntercomPort = async (host: string, serverPort: number): Promise<GFResult<number>> => {
  const portFromEnv = process.env[INTERCOM_PORT_ENV_VAR_NAME]
  const parsedPortFromEnv = portFromEnv != null ? parseInt(portFromEnv) : null
  if (parsedPortFromEnv != null && Number.isNaN(parsedPortFromEnv)) {
    return [undefined, createGFError({
      msg: c => `The ${c.bold(INTERCOM_PORT_ENV_VAR_NAME)} environment variable is present however not a valid integer. Recieved: ${c.cyan(portFromEnv)}`,
    })]
  }

  let err: GFError = null
  const port = await findFreePort({
    host,
    preferredPort: parsedPortFromEnv ?? DEFAULT_INTERCOM_PORT,
    exclusions: [serverPort], // Don't put Intercom on same port as Site Server
    maxAttempts: 10,
    events: {
      onAttemptStart: p => logIntercomStep(c => `Determining if port ${c.cyan(p.toString())} is available to use.`),
      onAttemptSuccess: p => logIntercomSuccess(c => `Port ${c.cyan(p.toString())} is available to use for ${NPM_PACKAGE_CAPITALIZED_NAME} Intercom.`),
      onAttemptFail: p => logIntercomError(c => `Port ${c.cyan(p.toString())} is not available to use for ${NPM_PACKAGE_CAPITALIZED_NAME} Intercom.`),
      onAttemptExcluded: p => logIntercomError(c => `Port ${c.cyan(p.toString())} is not available to use for ${NPM_PACKAGE_CAPITALIZED_NAME} Intercom because the ${NPM_PACKAGE_CAPITALIZED_NAME} Server is already using it.`),
      onAttemptUnexpectedError: (p, _err) => {
        err = createGFError({
          msg: c => `An unexpected error occured while determining whether port ${c.cyan(port.toString())} is available to use for ${NPM_PACKAGE_CAPITALIZED_NAME} Intercom.\n\n    Details: ${_err}.`,
        })
        return { exit: true }
      },
      onMaxAttempts: () => logIntercomError(c => `Max attempts exceeded for finding an available port to use for ${NPM_PACKAGE_CAPITALIZED_NAME} Intercom. Try using the ${c.bold(INTERCOM_PORT_ENV_VAR_NAME)} environment variable to explicitly set a different preferred port.`),
    },
  })

  return [port, err]
}

const createStartError = (inner?: GFError): GFError => createGFError({
  msg: `Could not start ${NPM_PACKAGE_CAPITALIZED_NAME}`,
  inner,
})

export const start = baseCommand('start', async (startOptions: StartCliArgumentsOptions): Promise<GFError> => {
  // -- Config
  // If verbose is specified in CLI arguments or env var, then we can globally set it earlier
  const earlyVerbose = startOptions.verbose != null
    ? startOptions.verbose
    : (process.env[VERBOSE_ENV_VAR_NAME] === 'true' ?? false)
  state.verbose = earlyVerbose

  // Get config for command
  logStepHeader('Determining supplied configuration.', true)
  const [config, getConfigError] = await getConfigForCommand(startOptions, applyStartOptionsToConfig)
  if (getConfigError != null)
    return getConfigError

  // Update global verbosity according to config
  state.verbose = config.verbose

  // -- Logic
  // Check packages required to build the Component Site for React, getting version numbers
  const [checkPackagesResult, checkPackagesError] = checkPackages()
  if (checkPackagesError != null)
    return checkPackagesError.wrap(createStartError())

  // Determine server port
  const [serverPort, determineServerPortError] = await determineServerPort(config)
  if (determineServerPortError != null)
    return determineServerPortError.wrap(createStartError())

  // Determine intercom port
  const [intercomPort, determineIntercomPortError] = await determineIntercomPort(config.site.host, serverPort)
  if (determineIntercomPortError != null)
    return determineIntercomPortError.wrap(createStartError())

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
      compSiteOutDir: './.exh/comp-site',
      indexExhOutDir: './.exh/comp-lib',
      serverRootDir: './.exh',
    })
  }
  catch (e: any) {
    return createGFError({
      msg: `Could not build the Component Site for React. This could be because you have a version of React that isn't supported. Otherwise, you may have some custom npm setup that ${NPM_PACKAGE_CAPITALIZED_NAME} can't handle.`,
      inner: e,
    }).wrap(createStartError())
  }

  // Start the site server
  logStep(`Starting ${NPM_PACKAGE_CAPITALIZED_NAME}`)
  const [serverProcess, startServerError] = await startServer({
    serverPort,
    intercomPort,
    config,
    // If the server dies, kill ourselves as well
    onServerProcessKill: () => process.exit(0),
  })

  if (startServerError != null)
    return startServerError

  return null
}, { exitWhenReturns: false })
