#!/usr/bin/env node
import { Command } from 'commander'
import mergeDeep from 'merge-deep'
import path from 'path'

import { DEFAULT_CONFIG_FILE_NAME } from '../common/paths'
import { getConfig } from './config'
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
  .name('exhibitor')
  .description('exhibitor CLI')
  .version('0.0.1')

program
  .command('start')
  .description('Starts the exhibitor site.')
  .option('-c, --config <path>', 'path to config file to use', './exh.config.json')
  .option('--port <port>', 'port to bind the site to.', '4001')
  .option('--host <host>', 'host to bind the site to.', 'localhost')
  .action((options: StartOptions) => {
    const configFilePath = options.config ?? path.join('./', DEFAULT_CONFIG_FILE_NAME)
    config = getConfig(configFilePath)
    configDir = path.dirname(configFilePath)
    const _config: Config = mergeDeep(config, {
      site: {
        port: options.port,
        host: options.host,
      },
    })
    start(_config, configDir)
  })

program.parse()
