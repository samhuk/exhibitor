import path from 'path'
import * as fs from 'fs'
import { Config } from './types'
import { ExhString } from '../exhString/types'
import { ExhError } from '../exhError/types'
import { createExhError } from '../exhError'

const createValidateConfigError = (causedBy: ExhString): ExhError => createExhError({
  message: 'Invalid configuration',
  causedBy,
})

export const _validateConfig = (config: Config): ExhString | null => {
  // -- include
  if (config.include.length < 1)
    return c => `config.include - must have at least one entry, if defined. Received: ${c.cyan(JSON.stringify(config.include))}`

  // -- watch
  if (config.watch.length < 1)
    return c => `config.watch - must have at least one entry, if defined. Received: ${c.cyan(JSON.stringify(config.watch))}`

  // -- site.host
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
  if (config.rootStyle != null && !fs.existsSync(config.rootStyle))
    return c => `config.rootStyle - path does not exist (${c.cyan(path.resolve(config.rootStyle))})`

  return null
}

export const validateConfig = (config: Config): ExhError | null => {
  const errorMessage = _validateConfig(config)

  return errorMessage != null
    ? createValidateConfigError(errorMessage)
    : null
}
