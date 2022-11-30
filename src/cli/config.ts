import merge from 'deepmerge'
import * as fs from 'fs'
import path from 'path'

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
  const configFromFile = fs.existsSync(configFilePath) ? readAndParseConfig(configFilePath) : null
  return configFromFile != null ? merge(DEFAULT_CONFIG, configFromFile, {
    arrayMerge: (t, s) => ((s != null && s.length > 0) ? s : t),
  }) : DEFAULT_CONFIG
}

export const makePathRelativeToConfigDir = (p: string, configDir: string): string => (
  // eslint-disable-next-line prefer-regex-literals
  path.join(configDir, p).replace(new RegExp('\\\\', 'g'), '/')
)

export const makePathsRelativeToConfigDir = (paths: string[], configDir: string): string[] => paths
  .map(p => makePathRelativeToConfigDir(p, configDir))
