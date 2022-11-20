import { Express } from 'express'
import path from 'path'
import livereload from 'livereload'
import connectLivereload from 'connect-livereload'
import { BUILD_OUTPUT_ROOT_DIR } from '../../common/paths'
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
    // Watch for changes to the components build output directory
    BUILD_OUTPUT_ROOT_DIR,
  ].filter(v => v != null))
  app.use(connectLivereload())
}
