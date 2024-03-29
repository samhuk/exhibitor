import path from 'path'
import * as fs from 'fs'
import { createGFError, GFError } from 'good-flow'
import { GFString } from 'good-flow/lib/good-flow/string/types'
import { Config } from './types'

export const _validateConfig = (config: Config): GFString | null => {
  // -- include
  if (config.include.length < 1)
    return c => `config.include - must have at least one entry, if defined. Received: ${c.cyan(JSON.stringify(config.include))}`

  // -- watch
  if (config.watch.length < 1)
    return c => `config.watch - must have at least one entry, if defined. Received: ${c.cyan(JSON.stringify(config.watch))}`

  // -- site.host
  if (typeof config.site.host !== 'string')
    return c => `config.site.host - must be a string. Received: ${c.cyan(JSON.stringify(config.site.host))}`

  if (config.site.host.length < 1)
    return 'config.site.host - cannot be empty'

  // -- site.port
  if (typeof config.site.port !== 'number')
    return c => `config.site.port - must be a number. Received: ${c.cyan(JSON.stringify(config.site.port))}`

  if (config.site.port < 1)
    return c => `config.site.port - cannot be less than ${c.cyan('1')}. Received: ${c.cyan(config.site.port.toString())}`

  if (config.site.port > 65535)
    return c => `config.site.port - cannot be greater than ${c.cyan('65535')}. Received: ${c.cyan(config.site.port.toString())}`

  // -- rootStyle
  // TODO: Deprecated
  if (config.rootStyle != null && !fs.existsSync(config.rootStyle))
    return c => `config.rootStyle - path does not exist (${c.cyan(path.resolve(config.rootStyle))})`

  // -- rootStyles
  if (config.rootStyles != null) {
    for (let i = 0; i < config.rootStyles.length; i += 1) {
      if (!fs.existsSync(config.rootStyles[i]))
        return c => `config.rootStyles[${c.cyan(i.toString())}] - path does not exist (${c.cyan(path.resolve(config.rootStyle))})`
    }
  }

  // -- demo
  if (config.demo.httpPort < 1)
    return c => `config.demo.httpPort - cannot be less than ${c.cyan('1')}. Received: ${c.cyan(config.demo.httpPort.toString())}`

  if (config.demo.httpPort > 65535)
    return c => `config.demo.httpPort - cannot be greater than ${c.cyan('65535')}. Received: ${c.cyan(config.demo.httpPort.toString())}`

  if (config.demo.httpsPort < 1)
    return c => `config.demo.httpsPort - cannot be less than ${c.cyan('1')}. Received: ${c.cyan(config.demo.httpsPort.toString())}`

  if (config.demo.httpsPort > 65535)
    return c => `config.demo.httpsPort - cannot be greater than ${c.cyan('65535')}. Received: ${c.cyan(config.demo.httpsPort.toString())}`

  if (config.demo.enableHttps === true && (config.demo.httpsDomains == null || config.demo.httpsDomains.length === 0))
    return c => `config.demo.httpsDomains - must be defined and have at least one entry if ${c.bold('config.demo.enableHttps')} is ${c.cyan('true')}. Received: ${c.cyan(JSON.stringify(config.demo.httpsDomains))}`

  return null
}

export const validateConfig = (config: Config): GFError | null => {
  const errorMessage = _validateConfig(config)

  return errorMessage != null
    ? createGFError({
      msg: 'Invalid configuration',
      inner: createGFError({ msg: errorMessage }),
    })
    : null
}
