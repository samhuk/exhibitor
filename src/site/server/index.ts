import cookieParser from 'cookie-parser'
import express from 'express'
import * as fs from 'fs'
import path from 'path'

import { BUILD_OUTPUT_ROOT_DIR, SITE_SERVER_BUILD_DIR_TO_CLIENT_BUILD_DIR_REL_PATH } from '../../common/paths'
import api from './api'
import { notFound } from './api/errorVariants'
import { sendErrorResponse } from './api/responses'
import { addHotReloadingMiddleware } from './appFeatures'
import { env } from './env'

const app = express()

// Hot-reloading
addHotReloadingMiddleware(app)

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
    // Special handling for if the requested url is a component library build file
    if (req.url.startsWith('/index.exh')) {
      if (fs.existsSync(path.join(BUILD_OUTPUT_ROOT_DIR, `.${req.path}`)))
        res.sendFile(req.path, { root: BUILD_OUTPUT_ROOT_DIR })
      else
        sendErrorResponse(req, res, notFound('Component library file not found.'))
      return
    }

    // If the client file exists, serve it
    if (fs.existsSync(path.resolve(clientDir, `./${req.path}`)))
      res.sendFile(req.path, { root: clientDir })
    // Else send index.html
    else
      res.sendFile('/', { root: clientDir })
  })

app.listen(env.port, env.host, () => {
  const url = `http://${env.host}:${env.port}`
  console.log(`Exhibitor active. Access via ${url}.`)
})
