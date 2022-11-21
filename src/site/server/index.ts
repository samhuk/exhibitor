import express from 'express'
import path from 'path'
import * as fs from 'fs'
import cookieParser from 'cookie-parser'
import api from './api'
import { addHotReloadingMiddleware } from './appFeatures'
import { env } from './env'
import { sendErrorResponse } from './api/responses'
import { notFound } from './api/errorVariants'
import { BUILD_OUTPUT_ROOT_DIR, SITE_SERVER_BUILD_DIR_TO_CLIENT_BUILD_DIR_REL_PATH } from '../../common/paths'

const app = express()

// Hot-reloading
if (!env.isProd)
  addHotReloadingMiddleware(app)

app.use(cookieParser())

// Handle api requests
app
  .use('/api', api)
  // Send 404 for api requests that don't match an api route
  .use('/api', (req, res) => sendErrorResponse(req, res, notFound('Unknown endpoint')))

// In dev mode we use the backend to serve client files, mimicking nginx in prod
if (!env.isProd) {
  const clientDir = path.resolve(__dirname, SITE_SERVER_BUILD_DIR_TO_CLIENT_BUILD_DIR_REL_PATH)

  app
    .get('*', (req, res) => {
      // Special handling for if the requested url is a component library build file
      if (req.url.startsWith('/index.exh')) {
        res.sendFile(req.path, { root: BUILD_OUTPUT_ROOT_DIR })
        return
      }

      const fullFilePath = path.resolve(clientDir, `./${req.path}`)
      // If the client file exists, serve it
      if (fs.existsSync(fullFilePath))
        res.sendFile(req.path, { root: clientDir })
      // Else send index.html
      else
        res.sendFile('/', { root: clientDir })
    })
}

app.listen(env.port, '0.0.0.0', () => {
  const url = `http://localhost:${env.port}`
  console.log(`API started in ${env.isProd ? 'Production' : 'Development'} mode. Access via ${url}.`)
})
