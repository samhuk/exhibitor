import { logInfo } from '../../common/logging'
import { ExpressApp } from './types'

export const enableRequestLogging = (app: ExpressApp) => {
  app.use('*', (req, res, next) => {
    logInfo(c => `Recieved request | URL: ${c.cyan(req.url)} | remote addr: ${c.cyan(req.socket.remoteAddress)} | ip: ${c.cyan(req.ip)} | x-forwarded-for: ${c.cyan(req.headers['x-forwarded-for'] as string)}`)
    next()
  })
}
