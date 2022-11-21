import * as fs from 'fs'
import path from 'path'
import { TEST_COMPONENT_LIBRARY_ROOT_DIR, DEFAULT_CONFIG_FILE_NAME } from '../common/paths'
import { Config } from './types'

export const readAndParseConfig = (
  configFilePath: string = './',
): Config => {
  const configString = fs.readFileSync(configFilePath, { encoding: 'utf8' })
  return JSON.parse(configString) as Config
}

export const getConfig = () => {
  console.log('==> Getting config')
  const isTesting = process.env.IS_EXHIBITOR_TESTING === 'true'
  const configFilePath = isTesting
    // E.g. ./test/componentLibrary/config.exh.json
    ? path.join(TEST_COMPONENT_LIBRARY_ROOT_DIR, DEFAULT_CONFIG_FILE_NAME)
    // E.g. ./config.exh.json
    : path.join('./', DEFAULT_CONFIG_FILE_NAME)

  return readAndParseConfig(configFilePath)
}
