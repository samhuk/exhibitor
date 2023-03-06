import { CONSOLE_LOG_CLIENT_REPORTER } from 'sock-state'
import createNodeStoreClient from 'sock-state/lib/client/node'
import { BuildStatus } from '../../common/building'
import { getEnv, ExhEnv } from '../../common/env'
import { logStep, logInfo } from '../../common/logging'
import { getIntercomNetworkLocationFromProcessEnvs } from '../../intercom/client'
import { BUILD_STATUSES_TOPIC, createBuildStatusesReducer } from '../../intercom/common'
import { BuildStatuses, BuildStatusesActions } from '../../intercom/types'
import { BuildStatusService, createBuildStatusService } from './buildStatusService'
import { ExpressApp } from './types'

const isDev = getEnv() === ExhEnv.DEV

export const createIntercomClient = () => {
  logStep('Creating build status service for Site Server.', true)
  const buildStatusService = createBuildStatusService({
    // Well, we are the site server, so if we are running then we must have successfully built!
    SITE_SERVER: BuildStatus.SUCCESS,
    // If the server is started by the CLI, then the site client and server is already built
    SITE_CLIENT: process.env.EXH_CLI === 'true' ? BuildStatus.SUCCESS : BuildStatus.NONE,
  })

  const networkLocation = getIntercomNetworkLocationFromProcessEnvs(process)
  const client = createNodeStoreClient({
    host: networkLocation.host,
    port: networkLocation.port,
    reporter: isDev ? CONSOLE_LOG_CLIENT_REPORTER : null,
  })

  const buildStatusesTopic = client.topic<BuildStatuses, BuildStatusesActions>(BUILD_STATUSES_TOPIC)

  buildStatusesTopic.on('state-change', createBuildStatusesReducer(), buildStatuses => {
    logInfo(c => `Site Server received build status update: ${c.cyan(JSON.stringify(buildStatuses))}`, true)
    buildStatusService.updateStatuses(buildStatuses)
  })

  client.connect()

  return {
    buildStatusService,
  }
}

export const enableBuildStatusWaitUntilAllSuccessfullMiddleware = (
  app: ExpressApp,
  buildStatusService: BuildStatusService,
) => {
  // For all requests to the http server, wait until all builds are successful.
  // TODO: We could serve a very simple page that displays a "not all successfully built yet" notice that listens on intercom.
  app.use('*', async (req, res, next) => {
    if (!buildStatusService.allSuccessful) {
      const unsuccessfulBuildStatusesString = buildStatusService.getUnsuccessfulBuilds().map(info => `${info.identity} (${info.status})`).join(', ')
      logInfo(c => `Request ${c.cyan(req.url)} must wait until all builds are successful. Waiting on: ${unsuccessfulBuildStatusesString}`)
      await buildStatusService.waitUntilNextAllSuccessful()
      next()
      return
    }

    next()
  })
}
