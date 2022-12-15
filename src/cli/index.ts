#!/usr/bin/env node
import { Command } from 'commander'

import { NPM_PACKAGE_NAME } from '../common/name'
import { init } from './commands/init'
import { start } from './commands/start'

const program = new Command()

program
  .name(NPM_PACKAGE_NAME)
  .description(`${NPM_PACKAGE_NAME} CLI`)
  .version('0.0.1')

// -- Init command
program
  .command('init')
  .description('Initializes the current directory for using exhibitor')
  .action(() => init())

// -- Start command
program
  .command('start')
  .description('Starts the exhibitor site.')
  .option('-c, --config <path>', 'path to config file to use')
  .option('--port <port>', 'port to bind the site to.')
  .option('--host <host>', 'host to bind the site to.')
  // eslint-disable-next-line max-len
  .option('--root-style <path>', 'Optional path to a CSS or SCSS stylesheet to include as a root style. This is useful for defining styles shared by all components, i.e. icon/style libraries like font-awesome, muicons, bootstrap, or your own.')
  .action(options => start(options))

program.parse()
