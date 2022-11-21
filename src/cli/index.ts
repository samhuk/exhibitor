#!/usr/bin/env node

import { getConfig } from './config'
import { start } from './start'

export const main = async () => {
  /* TODO: For now, we will just have one command - "run". Later on,
   * a proper CLI will be used to support more commands, arguments, etc.
   */

  const config = getConfig()

  start(config)
}

main()
