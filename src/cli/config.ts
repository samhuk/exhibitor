import merge from 'deepmerge'
import * as fs from 'fs'

import { Config } from './types'

export const DEFAULT_CONFIG: Config = {
  include: ['./**/*.exh.ts'],
  watch: ['./**/*'],
  site: {
    host: 'localhost',
    port: 4001,
  },
}

export const readAndParseConfig = (
  configFilePath: string = './',
): Config => {
  const configString = fs.readFileSync(configFilePath, { encoding: 'utf8' })
  return JSON.parse(configString) as Config
}

export const getConfig = (
  configFilePath: string = './exh.config.json',
) => {
  const configFromFile = fs.existsSync(configFilePath) ? readAndParseConfig(configFilePath) : {}
  return merge(configFromFile, DEFAULT_CONFIG, {
    arrayMerge: (t, s, o) => t,
  })
}
