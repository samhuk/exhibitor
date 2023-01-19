import connectLivereload from 'connect-livereload'
import { Express } from 'express'
import livereload from 'livereload'
import { logStep } from '../../cli/logging'

import { BUILD_OUTPUT_ROOT_DIR, SITE_CLIENT_OUTDIR } from '../../common/paths'

export const enableHotReloading = (app: Express): void => {
  const liveReloadServer = livereload.createServer()
  liveReloadServer.server.once('connection', () => {
    setTimeout(() => {
      liveReloadServer.refresh('/')
    }, 100)
  })

  // If the server is started for the npm "start" command, then the server will do it's own file watching
  if (process.env.EXH_START === 'true') {
    logStep(c => `In ${c.bold('EXH_START')} mode. Watching for changes to build output directories ([${c.cyan(SITE_CLIENT_OUTDIR)}, ${c.cyan(BUILD_OUTPUT_ROOT_DIR)}]).`)
    liveReloadServer.watch([
      /* watch for changes to client build output dir
       */
      SITE_CLIENT_OUTDIR,
      // Watch for changes to the components build output directory
      BUILD_OUTPUT_ROOT_DIR,
    ].filter(v => v != null))
  }
  // Else, the server will listen for messages to it's node process in order to reload clients
  else {
    process.on('message', () => {
      logStep('Refreshing clients...', true)
      liveReloadServer.refresh('/')
    })
  }

  app.use(connectLivereload({
    /* Exclude the component site routes from hot-reloading as the whole site
     * needs to reload anyway, which contains the comp-site in an iframe.
     */
    excludeList: ['/comp-site/**/*'],
  }))
}
