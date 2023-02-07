import cookieParser from 'cookie-parser'
import express from 'express'
import * as fs from 'fs'
import path from 'path'

import { BUILD_OUTPUT_ROOT_DIR, COMP_SITE_OUTDIR, SITE_SERVER_BUILD_DIR_TO_CLIENT_BUILD_DIR_REL_PATH } from '../../common/paths'
import { NPM_PACKAGE_CAPITALIZED_NAME } from '../../common/name'
import api from './api'
import { sendErrorResponse } from './common/responses'
import { DEFAULT_THEME } from '../../common/theme'
import { createExhError } from '../../common/exhError'
import { ErrorType } from '../../common/errorTypes'
import { loadConfig } from './config'
import { VERBOSE_ENV_VAR_NAME } from '../../common/config'
import { log, logInfo } from '../../common/logging'
import { BuildStatus } from '../../common/building'
import { ExhEnv, getEnv } from '../../common/env'
import { createBuildStatusService } from '../../intercom/server/buildStatusService'
import { createInteromServer } from '../../intercom/server'
import state from '../../common/state'

const main = async () => {
  // If verbose env var is true, then we can enable the verbose mode for the process earlier here
  state.verbose = process.env[VERBOSE_ENV_VAR_NAME] === 'true'

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

  const host = process.env.EXH_SITE_SERVER_HOST ?? 'localhost'
  const port = process.env.EXH_SITE_SERVER_PORT != null
    ? parseInt(process.env.EXH_SITE_SERVER_PORT)
    : 4001
  const isDev = getEnv() === ExhEnv.DEV

  const server = app.listen(port, host, () => {
    const url = `http://${host}:${port}`
    log(c => `${(c.green as any).bold(`${NPM_PACKAGE_CAPITALIZED_NAME} active`)}. Access via ${(c.cyan as any).underline(url)}.${isDev ? ' [DEVELOPMENT]' : ''}`)
  })

  server.keepAliveTimeout = 10000 * 1000
}

main()
