import cookieParser from 'cookie-parser'
import express from 'express'
import * as fs from 'fs'
import path from 'path'
import colors from 'colors/safe'

import { BUILD_OUTPUT_ROOT_DIR, COMP_SITE_OUTDIR, SITE_SERVER_BUILD_DIR_TO_CLIENT_BUILD_DIR_REL_PATH } from '../../common/paths'
import api from './api'
import { notFound } from './api/errorVariants'
import { sendErrorResponse } from './api/responses'
import { env } from './env'
import { enableHotReloading } from './hotReloading'

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

    if (req.path === '/comp-site') {
      res.sendFile('index.html', { root: COMP_SITE_OUTDIR })
      return
    }

    if (req.path === '/comp-site/index.js') {
      res.sendFile('index.js', { root: COMP_SITE_OUTDIR })
      return
    }

    // If file exists in build output dir, then serve it
    if (fs.existsSync(path.join(BUILD_OUTPUT_ROOT_DIR, `.${req.path}`))) {
      res.sendFile(req.path, { root: BUILD_OUTPUT_ROOT_DIR })
      return
    }

    // If the site client file exists, then serve it
    if (fs.existsSync(path.resolve(clientDir, `.${req.path}`))) {
      res.sendFile(req.path, { root: clientDir })
      return
    }

    // Else send index.html
    res.sendFile('/', { root: clientDir })
  })

const server = app.listen(env.port, env.host, () => {
  const url = `http://${env.host}:${env.port}`
  console.log(`${(colors.green as any).bold('Exhibitor active')}. Access via ${(colors.cyan as any).underline(url)}.${process.env.NODE_ENV === 'development' ? ' [DEVELOPMENT]' : ''}`)
})

server.keepAliveTimeout = 10000 * 1000
