import * as fs from 'fs'
import mergeDeep from 'merge-deep'

import { Config } from './types'

export const DEFAULT_CONFIG: Config = {
  include: ['./**/*.exh.ts'],
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
  return mergeDeep(configFromFile, DEFAULT_CONFIG)
}
