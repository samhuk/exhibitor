import cookieParser from 'cookie-parser'
import express from 'express'
import * as fs from 'fs'
import path from 'path'

import { BUILD_OUTPUT_ROOT_DIR, COMP_SITE_OUTDIR, SITE_SERVER_BUILD_DIR_TO_CLIENT_BUILD_DIR_REL_PATH } from '../../common/paths'
import { NPM_PACKAGE_CAPITALIZED_NAME } from '../../common/name'
import api from './api'
import { sendErrorResponse } from './common/responses'
import { env } from './env'
import { DEFAULT_THEME } from '../../common/theme'
import { log } from '../../cli/logging'
import { createExhError } from '../../common/exhError'
import { ErrorType } from '../../common/errorTypes'
import { createInteromServer } from './intercom'
import { loadConfig } from './config'
import { VERBOSE_ENV_VAR_NAME } from '../../common/config'
import { updateProcessVerbosity } from '../../common/processState'
import { createBuildStatusService } from '../../common/intercom/buildStatusService'
import { logInfo } from '../../common/logging'
import { BuildStatus } from '../../common/building'

const main = async () => {
  // If verbose env var is true, then we can enable the verbose mode for the process earlier here
  updateProcessVerbosity(process.env[VERBOSE_ENV_VAR_NAME] === 'true')

  await loadConfig()

  const buildStatusService = createBuildStatusService({
    // These are not yet involved in the live-reload intercom system
    CLI: BuildStatus.SUCCESS,
    SITE_SERVER: BuildStatus.SUCCESS,
    // If the server is started by the CLI, then the client is already built
    CLIENT_WATCH: process.env.EXH_CLI === 'true' ? BuildStatus.SUCCESS : BuildStatus.NONE,
  })

  createInteromServer(buildStatusService)

  const app = express()
  app.use(cookieParser())

  // For all requests to the http server, wait until all builds are successful.
  // TODO: We could serve a very simple page that displays a "not all successfully built yet" notice that listens on intercom.
  app
    .use('*', async (req, res, next) => {
      if (!buildStatusService.allSuccessful) {
        const unsuccessfulBuildStatusesString = buildStatusService.getUnsuccessfulBuilds().map(info => `${info.identityType} (${info.status})`).join(', ')
        logInfo(c => `Request ${c.cyan(req.url)} must wait until all builds are successful. Waiting on: ${unsuccessfulBuildStatusesString}`)
        await buildStatusService.waitUntilNextAllSuccessful()
        next()
        return
      }

      next()
    })

  // Handle api requests
  app
    .use('/api', api)
    // Send 404 for api requests that don't match an api route
    .use('/api', (req, res) => sendErrorResponse(res, createExhError({ message: 'unknown endpoint', type: ErrorType.NOT_FOUND })))

  // We use the backend to serve client files
  const clientDir = path.resolve(__dirname, SITE_SERVER_BUILD_DIR_TO_CLIENT_BUILD_DIR_REL_PATH)

  app
    .get('*', (req, res) => {
      if (req.path === '/') {
        res.sendFile('/', { root: clientDir })
        return
      }

      // -- axe
      if (req.path === '/axe.js') {
        const pathSuffix = 'node_modules/axe-core/axe.min.js'
        const relPath = `./${pathSuffix}`
        if (fs.existsSync(relPath)) {
          res.sendFile(`/${pathSuffix}`, { root: './' })
          return
        }

        sendErrorResponse(res, createExhError({ message: `Cannot find axe script at ${relPath}'`, type: ErrorType.NOT_FOUND }))
        return
      }

      // -- Theme
      if (req.path === '/styles.css') {
        const theme = req.cookies.theme ?? DEFAULT_THEME

        if (fs.existsSync(path.join(clientDir, `./${theme}.css`))) {
          res.sendFile(`/${theme}.css`, { root: clientDir })
          return
        }

        sendErrorResponse(res, createExhError({ message: `Styles do not exist for theme '${theme}'`, type: ErrorType.NOT_FOUND }))
        return
      }

      // -- comp-site
      if (req.path.startsWith('/comp-site')) {
        const _path = req.path.substring('/comp-site'.length)
        const __path = _path.length === 0 ? '/index.html' : _path
        res.sendFile(__path, { root: COMP_SITE_OUTDIR })
        return
      }

      // -- ./.exh (build output root dir)
      if (fs.existsSync(path.join(BUILD_OUTPUT_ROOT_DIR, `.${req.path}`))) {
        res.sendFile(req.path, { root: BUILD_OUTPUT_ROOT_DIR })
        return
      }

      // -- site client
      if (fs.existsSync(path.resolve(clientDir, `.${req.path}`))) {
        res.sendFile(req.path, { root: clientDir })
        return
      }

      // -- site client index.html (SPA behavior)
      res.sendFile('/', { root: clientDir })
    })

  const server = app.listen(env.port, env.host, () => {
    const url = `http://${env.host}:${env.port}`
    log(c => `${(c.green as any).bold(`${NPM_PACKAGE_CAPITALIZED_NAME} active`)}. Access via ${(c.cyan as any).underline(url)}.${process.env.NODE_ENV === 'development' ? ' [DEVELOPMENT]' : ''}`)
  })

  server.keepAliveTimeout = 10000 * 1000
}

main()
