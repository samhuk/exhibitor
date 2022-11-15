import { Express } from 'express'
import path from 'path'
import livereload from 'livereload'
import connectLivereload from 'connect-livereload'

export const addHotReloadingMiddleware = (app: Express): void => {
  const liveReloadServer = livereload.createServer()
  liveReloadServer.server.once('connection', () => {
    setTimeout(() => {
      liveReloadServer.refresh('/')
    }, 100)
  })
  liveReloadServer.watch(path.resolve(__dirname, '../'))
  app.use(connectLivereload())
}
