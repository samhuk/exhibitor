import connectLivereload from 'connect-livereload'
import { Express } from 'express'
import livereload from 'livereload'

import { BUILD_OUTPUT_ROOT_DIR, SITE_CLIENT_OUTDIR } from '../../common/paths'
import { env } from './env'

export const enableHotReloading = (app: Express): void => {
  const liveReloadServer = livereload.createServer()
  liveReloadServer.server.once('connection', () => {
    setTimeout(() => {
      liveReloadServer.refresh('/')
    }, 100)
  })
  liveReloadServer.watch([
    /* If exhibitor is in dev mode, we will watch for
     * changes to client build output dir
     */
    env.isDev ? SITE_CLIENT_OUTDIR : null,
    // Watch for changes to the components build output directory
    BUILD_OUTPUT_ROOT_DIR,
  ].filter(v => v != null))
  app.use(connectLivereload({
    /* Exclude the component site routes from hot-reloading as the whole site
     * needs to reload, which contains the comp-site in an iframe.
     */
    excludeList: ['/comp-site/**/*'],
  }))
}
