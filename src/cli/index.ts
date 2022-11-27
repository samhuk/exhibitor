#!/usr/bin/env node
import { Command } from 'commander'
import merge from 'deepmerge'
import path from 'path'

import { NPM_PACKAGE_NAME } from '../common/name'
import { DEFAULT_CONFIG_FILE_NAME } from '../common/paths'
import { DEFAULT_CONFIG, getConfig } from './config'
import { start } from './start'
import { Config } from './types'

type Options = {
  config?: string
}

type StartOptions = Options & {
  port: number
  host: string
}

const program = new Command()

let config: Config = null
let configDir: string = null

program
  .name(NPM_PACKAGE_NAME)
  .description(`${NPM_PACKAGE_NAME} CLI`)
  .version('0.0.1')

const applyStartOptionsToConfig = (
  _config: Config,
  options: StartOptions,
) => {
  const __config: Config = merge(config, {
    site: {
      port: options.port,
      host: options.host,
    },
  })
  return __config
}

program
  .command('start')
  .description('Starts the exhibitor site.')
  .option('-c, --config <path>', 'path to config file to use', `./${DEFAULT_CONFIG_FILE_NAME}`)
  .option('--port <port>', 'port to bind the site to.', DEFAULT_CONFIG.site.port.toString())
  .option('--host <host>', 'host to bind the site to.', DEFAULT_CONFIG.site.host)
  .action((options: StartOptions) => {
    const configFilePath = options.config ?? path.join('./', DEFAULT_CONFIG_FILE_NAME)
    config = getConfig(configFilePath)
    configDir = path.dirname(configFilePath)
    start(applyStartOptionsToConfig(config, options), configDir)
  })

program.parse()
