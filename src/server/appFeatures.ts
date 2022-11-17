import { Express } from 'express'
import path from 'path'
import livereload from 'livereload'
import connectLivereload from 'connect-livereload'
import { COMPONENTS_BUNDLE_DIR } from '../api/builder/paths'
import { env } from './env'

export const addHotReloadingMiddleware = (app: Express): void => {
  const liveReloadServer = livereload.createServer()
  liveReloadServer.server.once('connection', () => {
    setTimeout(() => {
      liveReloadServer.refresh('/')
    }, 100)
  })
  liveReloadServer.watch([
    /* If exhibitor is in testing mode, we will watch for
     * changes to own client and server output files.
     */
    env.isTesting ? path.resolve(__dirname, '../') : null,
    // Changes to the components bundle directory
    COMPONENTS_BUNDLE_DIR,
  ].filter(v => v != null))
  app.use(connectLivereload())
}
