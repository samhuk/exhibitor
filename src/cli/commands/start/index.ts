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
import { IntercomClient, IntercomIdentityType, IntercomMessageType } from '../../../common/intercom/types'
import { logIntercomError, logIntercomStep, logIntercomSuccess } from '../../../common/logging'
import { ExhError } from '../../../common/exhError/types'
import { createExhError, isExhError } from '../../../common/exhError'
import { DEFAULT_INTERCOM_PORT, INTERCOM_PORT_ENV_VAR_NAME } from '../../../common/intercom'
import { findFreePort } from '../../common/isPortFree'
import { BuildStatus, BuildStatusReporter, createBuildStatusReporter } from '../../../common/building'
import { ExhEnv, getEnv } from '../../../common/env'
import { VERBOSE_ENV_VAR_NAME } from '../../../common/config'

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

const determineIntercomPort = async (config: Config): Promise<number | ExhError> => {
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
    host: config.site.host,
    preferredPort: parsedPortFromEnv ?? DEFAULT_INTERCOM_PORT,
    exclusions: [config.site.port], // Don't put Intercom on same port as Site Server
    maxAttempts: 10,
    events: {
      onAttemptStart: p => logIntercomStep(c => `Determining if port ${c.cyan(p.toString())} is available to use.`),
      onAttemptSuccess: p => logIntercomSuccess(c => `Port ${c.cyan(p.toString())} is available to use.`),
      onAttemptFail: p => logIntercomError(c => `Port ${c.cyan(p.toString())} is not available to use.`),
      onAttemptExcluded: p => logIntercomError(c => `Port ${c.cyan(p.toString())} is not available to use because the ${NPM_PACKAGE_CAPITALIZED_NAME} Site has already been configured to use it.`),
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

export const start = baseCommand('start', async (startOptions: StartCliArgumentsOptions): Promise<CliError> => {
  // -- Config
  // If verbose is specified in CLI arguments or env var, then we can globally set it earlier
  const earlyVerbose = startOptions.verbose != null
    ? startOptions.verbose
    : (process.env[VERBOSE_ENV_VAR_NAME] === 'true' ?? false)
  updateProcessVerbosity(earlyVerbose)

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

  // Create intercom client
  const intercomPort = await determineIntercomPort(config)
  if (isExhError(intercomPort))
    return intercomPort

  let compLibBuildStatusReporter: BuildStatusReporter
  let intercomClient: IntercomClient

  const sendBuildStatusUpdateToIntercom = (status: BuildStatus, prevStatus: BuildStatus) => {
    intercomClient.send({
      type: IntercomMessageType.BUILD_STATUS_CHANGE,
      status,
      prevStatus,
    })
  }

  const sendCurrentBuildStatusUpdateToIntercom = () => {
    intercomClient.send({
      type: IntercomMessageType.BUILD_STATUS_CHANGE,
      status: compLibBuildStatusReporter.status,
      prevStatus: compLibBuildStatusReporter.status,
    })
  }

  compLibBuildStatusReporter = createBuildStatusReporter({
    onChange: sendBuildStatusUpdateToIntercom,
  })

  intercomClient = createIntercomClient({
    host: config.site.host,
    port: intercomPort,
    identityType: IntercomIdentityType.COMP_LIB_WATCH,
    webSocketCreator: url => new WebSocket(url) as any,
    enableLogging: process.env.EXH_SHOW_INTERCOM_LOG === 'true',
    events: {
      onReconnect: () => {
        // When we reconnect to Intercom, send our status
        sendCurrentBuildStatusUpdateToIntercom()
      },
    },
  })

  try {
    // Watch Component Site, waiting for first successful build
    await watchCompSiteWaitForFirstSuccessfulBuild({
      skipPrebuild: isDev,
      reactMajorVersion: checkPackagesResult.reactMajorVersion,
      config,
      onIndexExhTsFileCreate: createOnIndexExhTsFileCreateHandler(config, {
        host: intercomClient.host,
        port: intercomClient.port,
        enableLogging: process.env.EXH_SHOW_INTERCOM_LOG === 'true',
      }),
      buildStatusReporter: compLibBuildStatusReporter,
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
    intercomPort,
    config,
    // If the server dies, kill ourselves as well
    onServerProcessKill: () => process.exit(0),
  })

  // If start server result is not a child process, then it's an error, therefore return.
  if (!(startServerResult instanceof ChildProcess))
    return startServerResult

  // Once the site server process has started, try and connect our intercom client to it.
  await intercomClient.connect()

  // When we first connect to Intercom, send our status
  sendCurrentBuildStatusUpdateToIntercom()

  return null
}, { exitWhenReturns: false })
