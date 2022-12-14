import cookieParser from 'cookie-parser'
import express from 'express'
import * as fs from 'fs'
import path from 'path'
import colors from 'colors/safe'

import { BUILD_OUTPUT_ROOT_DIR, COMP_SITE_OUTDIR, SITE_SERVER_BUILD_DIR_TO_CLIENT_BUILD_DIR_REL_PATH } from '../../common/paths'
import { NPM_PACKAGE_CAPITALIZED_NAME } from '../../common/name'
import api from './api'
import { notFound } from './api/errorVariants'
import { sendErrorResponse } from './api/responses'
import { env } from './env'
import { enableHotReloading } from './hotReloading'
import { DEFAULT_THEME } from '../../common/theme'

const app = express()

enableHotReloading(app)

app.use(cookieParser())

// Handle api requests
app
  .use('/api', api)
  // Send 404 for api requests that don't match an api route
  .use('/api', (req, res) => sendErrorResponse(req, res, notFound('Unknown endpoint')))

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
      const pathPart = 'node_modules/axe-core/axe.min.js'
      const relPath = `./${pathPart}`
      if (fs.existsSync(relPath)) {
        res.sendFile(`/${pathPart}`, { root: './' })
        return
      }

      sendErrorResponse(req, res, notFound(`Cannot find axe script at ${relPath}'`))
      return
    }

    // -- Theme
    if (req.path === '/styles.css') {
      const theme = req.cookies.theme ?? DEFAULT_THEME

      if (fs.existsSync(path.join(clientDir, `./${theme}.css`))) {
        res.sendFile(`/${theme}.css`, { root: clientDir })
        return
      }

      sendErrorResponse(req, res, notFound(`Styles do not exist for theme '${theme}'`))
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
  console.log(`${(colors.green as any).bold(`${NPM_PACKAGE_CAPITALIZED_NAME} active`)}. Access via ${(colors.cyan as any).underline(url)}.${process.env.NODE_ENV === 'development' ? ' [DEVELOPMENT]' : ''}`)
})

server.keepAliveTimeout = 10000 * 1000
