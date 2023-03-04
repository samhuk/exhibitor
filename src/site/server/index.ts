import cookieParser from 'cookie-parser'
import express from 'express'
import * as fs from 'fs'
import path from 'path'
import createNodeStoreClient from 'sock-state/lib/client/node'
import { CONSOLE_LOG_CLIENT_REPORTER } from 'sock-state'

import { BUILD_OUTPUT_ROOT_DIR, COMP_SITE_OUTDIR, SITE_SERVER_BUILD_DIR_TO_CLIENT_BUILD_DIR_REL_PATH } from '../../common/paths'
import { NPM_PACKAGE_CAPITALIZED_NAME } from '../../common/name'
import api from './api'
import { sendErrorResponse } from './common/responses'
import { DEFAULT_THEME } from '../../common/theme'
import { createExhError } from '../../common/exhError'
import { ErrorType } from '../../common/errorTypes'
import { loadConfig } from './config'
import { VERBOSE_ENV_VAR_NAME } from '../../common/config'
import { log, logInfo, logStep } from '../../common/logging'
import { BuildStatus } from '../../common/building'
import { ExhEnv, getEnv } from '../../common/env'
import state from '../../common/state'
import { getIntercomNetworkLocationFromProcessEnvs } from '../../intercom/client'
import { createBuildStatusesReducer, BUILD_STATUSES_TOPIC } from '../../intercom/common'
import { BuildStatusService, createBuildStatusService } from './buildStatusService'
import { BuildStatuses, BuildStatusesActions } from '../../intercom/types'
import { tryResolve } from '../../common/npm/resolve'

const isDev = getEnv() === ExhEnv.DEV

const createIntercomClient = () => {
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

const enableBuildStatusWaitUntilAllSuccessfullMiddleware = (
  app: ReturnType<typeof express>,
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

const handleAxeJsRequest = (app: ReturnType<typeof express>) => {
  app.get('/axe.js', (req, res) => {
    const resolveAxeCoreResult = tryResolve('axe-core')
    if (resolveAxeCoreResult.success === false) {
      sendErrorResponse(res, createExhError({ message: 'Could not resolve axe-core NPM dependency. Is it installed?', type: ErrorType.SERVER_ERROR }))
      return
    }
    const minJsRelPath = path.relative('.', path.join(path.dirname(resolveAxeCoreResult.path), 'axe.min.js'))
    res.sendFile(`/${minJsRelPath}`, { root: './' })
  })
}

const handleApiRequest = (app: ReturnType<typeof express>) => {
  app
    .use('/api', api)
    // Send 404 for api requests that don't match an api route
    .use('/api', (req, res) => sendErrorResponse(res, createExhError({ message: 'unknown endpoint', type: ErrorType.NOT_FOUND })))
}

const handleThemeStylesheetRequest = (app: ReturnType<typeof express>, clientBuildDir: string) => {
  app.get('/styles.css', (req, res) => {
    const theme = req.cookies.theme ?? DEFAULT_THEME

    if (fs.existsSync(path.join(clientBuildDir, `./${theme}.css`))) {
      res.sendFile(`/${theme}.css`, { root: clientBuildDir })
      return
    }

    sendErrorResponse(res, createExhError({ message: `Styles do not exist for theme '${theme}'`, type: ErrorType.NOT_FOUND }))
  })
}

const main = async () => {
  // If verbose env var is true, then we can enable the verbose mode for the process earlier here
  state.verbose = process.env[VERBOSE_ENV_VAR_NAME] === 'true'

  await loadConfig()

  const app = express()
  app.use(cookieParser())

  // If in demo mode, everything is static and already built
  if (process.env.EXH_DEMO !== 'true') {
    const { buildStatusService } = createIntercomClient()
    enableBuildStatusWaitUntilAllSuccessfullMiddleware(app, buildStatusService)
  }

  handleApiRequest(app)
  handleAxeJsRequest(app)

  // If not in demo-mode, then we will use the Site Server to serve Site Client files.
  if (process.env.EXH_DEMO !== 'true') {
    // We use the backend to serve client files
    const clientBuildDir = path.resolve(__dirname, SITE_SERVER_BUILD_DIR_TO_CLIENT_BUILD_DIR_REL_PATH)

    handleThemeStylesheetRequest(app, clientBuildDir)

    app
      .get('*', (req, res) => {
        if (req.path === '/') {
          res.sendFile('/', { root: clientBuildDir })
          return
        }

        // -- Component Site/Lib
        // This essentially mimiks NGINX's "try files" directive by first trying to serve the req at a file then as a directory (index.html).
        if (req.path.startsWith('/comp-site') || req.path.startsWith('/comp-lib')) {
          const reqPathWithoutForwardSlashPrefix = req.path.startsWith('/') ? req.path.slice(1) : req.path
          const relPath = path.join(BUILD_OUTPUT_ROOT_DIR, reqPathWithoutForwardSlashPrefix) // E.g.
          if (!fs.existsSync(relPath)) {
            sendErrorResponse(res, createExhError({ message: `Component Site/Lib file at '${relPath}' does not exist.`, type: ErrorType.NOT_FOUND }))
            return
          }

          if (fs.lstatSync(relPath).isFile())
            res.sendFile(reqPathWithoutForwardSlashPrefix, { root: BUILD_OUTPUT_ROOT_DIR })
          else
            res.sendFile(path.join(reqPathWithoutForwardSlashPrefix, 'index.html'), { root: BUILD_OUTPUT_ROOT_DIR })

          return
        }

        // -- Site Client files
        if (fs.existsSync(path.resolve(clientBuildDir, `.${req.path}`))) {
          res.sendFile(req.path, { root: clientBuildDir })
          return
        }

        // -- Fallback to Site Client index.html (SPA behavior)
        res.sendFile('/', { root: clientBuildDir })
      })
  }

  const host = process.env.EXH_SITE_SERVER_HOST ?? 'localhost'
  const port = process.env.EXH_SITE_SERVER_PORT != null
    ? parseInt(process.env.EXH_SITE_SERVER_PORT)
    : 4001

  const server = app.listen(port, host, () => {
    const url = `http://${host}:${port}`
    log(c => `${(c.green as any).bold(`${NPM_PACKAGE_CAPITALIZED_NAME} active`)}. Access via ${(c.cyan as any).underline(url)}.${isDev ? ' [DEVELOPMENT]' : ''}`)
  })

  server.keepAliveTimeout = 10000 * 1000
}

main()
