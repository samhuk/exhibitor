#!/usr/bin/env node
import { Command } from 'commander'
import merge from 'deepmerge'
import path from 'path'
import { exit } from 'process'

import { NPM_PACKAGE_NAME } from '../common/name'
import { DEFAULT_CONFIG_FILE_NAME } from '../common/paths'
import { printErrorResult } from './commandResult'
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

const _start = async (options: StartOptions) => {
  const configFilePath = options.config ?? path.join('./', DEFAULT_CONFIG_FILE_NAME)
  config = getConfig(configFilePath)
  configDir = path.dirname(configFilePath)
  const result = await start(applyStartOptionsToConfig(config, options), configDir)
  if (result.success === false) {
    printErrorResult(result)
    exit(1)
  }
}

program
  .command('start')
  .description('Starts the exhibitor site.')
  .option('-c, --config <path>', 'path to config file to use', `./${DEFAULT_CONFIG_FILE_NAME}`)
  .option('--port <port>', 'port to bind the site to.', DEFAULT_CONFIG.site.port.toString())
  .option('--host <host>', 'host to bind the site to.', DEFAULT_CONFIG.site.host)
  .action((options: StartOptions) => _start(options))

program.parse()
