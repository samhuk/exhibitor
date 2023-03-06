import cookieParser from 'cookie-parser'
import express from 'express'
import * as fs from 'fs'
import path from 'path'

import { BUILD_OUTPUT_ROOT_DIR, SITE_SERVER_BUILD_DIR_TO_CLIENT_BUILD_DIR_REL_PATH } from '../../common/paths'
import { NPM_PACKAGE_CAPITALIZED_NAME } from '../../common/name'
import api from './api'
import { sendErrorResponse } from './common/responses'
import { DEFAULT_THEME } from '../../common/theme'
import { createExhError } from '../../common/exhError'
import { ErrorType } from '../../common/errorTypes'
import { loadConfig } from './config'
import { VERBOSE_ENV_VAR_NAME } from '../../common/config'
import { log } from '../../common/logging'
import { ExhEnv, getEnv } from '../../common/env'
import state from '../../common/state'
import { tryResolve } from '../../common/npm/resolve'
import { ExpressApp } from './types'
import { enableRequestLogging } from './logging'
import { createIntercomClient, enableBuildStatusWaitUntilAllSuccessfullMiddleware } from './intercom'

const isDev = getEnv() === ExhEnv.DEV
const isDemo = process.env.EXH_DEMO === 'true'

const handleAxeJsRequest = (app: ExpressApp) => {
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

const handleApiRequest = (app: ExpressApp) => {
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

  // In dev, enable logging for each request.
  if (isDev)
    enableRequestLogging(app)

  // In demo mode, everything is already and always built, so we don't need to integrate with Intercom.
  if (!isDemo) {
    const { buildStatusService } = createIntercomClient()
    enableBuildStatusWaitUntilAllSuccessfullMiddleware(app, buildStatusService)
  }

  // Handle /api and /axe.js requests
  handleApiRequest(app)
  handleAxeJsRequest(app)

  // If not in demo-mode, then we will use the Site Server to serve Site Client files.
  if (!isDemo) {
    // We use the backend to serve client files
    const clientBuildDir = path.resolve(__dirname, SITE_SERVER_BUILD_DIR_TO_CLIENT_BUILD_DIR_REL_PATH)

    handleThemeStylesheetRequest(app, clientBuildDir)

    app
      .get('*', (req, res) => {
        if (req.path === '/') {
          res.sendFile('/', { root: clientBuildDir })
          return
        }

        // -- Component Site/Lib files
        // This essentially mimiks NGINX's "try files" directive by first trying to serve the req as a file then as a directory (index.html).
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
