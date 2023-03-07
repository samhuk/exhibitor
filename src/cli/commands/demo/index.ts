import path from 'path'
import * as fs from 'fs'
import { ChildProcess, spawn } from 'child_process'
import { copySync } from 'fs-extra'

import { ExhEnv, getEnv } from '../../../common/env'
import { ExhError } from '../../../common/exhError/types'
import { baseCommand } from '../common'
import { build } from '../../../comp-site/react/build/build'
import { checkPackages } from '../start/checkPackages'
import { isExhError } from '../../../common/exhError'
import { Config } from '../../../common/config/types'
import { log, logInfo, logStep, logStepHeader, logSuccess } from '../../../common/logging'
import { getConfigForCommand } from '../../config'
import { DemoCliArgumentsOptions } from './types'
import { applyDemoOptionsToConfig } from './config'
import { createOnIndexExhTsFileCreateHandler } from '../start'
import { VERBOSE_ENV_VAR_NAME } from '../../../common/config'
import { logFeatureStatus } from '../../../common/logging/notices'
import { modifyFileText } from './fileModifier'

const exhEnv = getEnv()
const isDev = exhEnv === ExhEnv.DEV

const copyFilesFromSrcDirToDestDir = (srcDir: string, destDir: string, srcFileNames: string[]) => {
  for (let i = 0; i < srcFileNames.length; i += 1)
    fs.copyFileSync(path.join(srcDir, srcFileNames[i]), path.join(destDir, srcFileNames[i]))
}

const buildCompSite = async (config: Config, demoBuildOutDir: string): Promise<ExhError | undefined> => {
  // Check packages required to build the Component Site for React, getting version numbers
  const checkPackagesResult = checkPackages()
  if (isExhError(checkPackagesResult))
    return checkPackagesResult

  await build({
    skipPrebuild: isDev,
    reactMajorVersion: checkPackagesResult.reactMajorVersion,
    config,
    onIndexExhTsFileCreate: createOnIndexExhTsFileCreateHandler(config, null, true, path.join(demoBuildOutDir, 'server/metadata.json')),
    compSiteOutDir: path.join(demoBuildOutDir, 'client/comp-site'),
    indexExhOutDir: path.join(demoBuildOutDir, 'client/comp-lib'),
    serverRootDir: path.join(demoBuildOutDir, 'client'),
  })

  return undefined
}

const enablePrettyProcessLogging = (process: ChildProcess, processName: string) => {
  process.stdout.on('data', data => {
    log(c => `${c.blue(`[${processName}]`)} ${String(data).trimEnd()}`)
  })

  process.stderr.on('data', data => {
    log(c => `${c.blue(`[${processName}]`)} ${c.red(String(data).trimEnd())}`)
  })
}

const handleProcessExit = (code: number, signal: NodeJS.Signals, processName: string) => {
  if (code === 0) {
    log(c => `${c.blue(`[${processName}]`)} ${c.green('Completed successfully.')}`)
  }
  else {
    log(c => `${c.blue(`[${processName}]`)} ${c.red('Failed. Code:')} ${c.cyan(code.toString())}, signal: ${c.cyan(signal)}`)
    process.exit(1)
  }
}

const createSiteServerPackageJsonForDocker = (
  npmLibDir: string,
  demoBuildOutputServerDir: string,
) => {
  logStepHeader('Creating package.json file to provide Site Server dependencies within Docker', true)
  const packageJsonPath = exhEnv === ExhEnv.REL ? path.join(npmLibDir, '../package.json') : './dist/npm/exhibitor/package.json'
  logStep(c => `Reading package.json from ${c.cyan(path.resolve(packageJsonPath))}.`, true)
  const packageJsonText = fs.readFileSync(packageJsonPath, 'utf8')
  const packageInfo = JSON.parse(packageJsonText)
  logStep('Excluding NPM dependencies that are not for Site Server.', true)
  const cliOnlyDeps = ['commander', 'esbuild', 'chokidar', 'chokidar-debounced', 'esbuild-sass-plugin', 'fs-extra']
  cliOnlyDeps.forEach(depName => delete packageInfo.dependencies[depName])
  const newPackageInfo = {
    dependencies: packageInfo.dependencies,
  }
  const outPath = path.join(demoBuildOutputServerDir, 'package.json')
  logStep(c => `Writing new package.json file to ${c.cyan(path.resolve(outPath))}.`, true)
  fs.writeFileSync(outPath, JSON.stringify(newPackageInfo, null, 2))
}

export const demo = baseCommand('demo', async (options: DemoCliArgumentsOptions): Promise<ExhError | null | undefined> => {
  logFeatureStatus('demo CLI command', 'alpha')

  // If verbose is specified in CLI arguments or env var, then we can globally set it earlier
  const earlyVerbose = options.verbose != null
    ? options.verbose
    : (process.env[VERBOSE_ENV_VAR_NAME] === 'true' ?? false)
  state.verbose = earlyVerbose

  // Get config for command
  logStepHeader('Determining supplied configuration', true)
  const getConfigResult = await getConfigForCommand(options, applyDemoOptionsToConfig)
  if (isExhError(getConfigResult))
    return getConfigResult

  const config = getConfigResult // Convenient alias

  // Update global verbosity according to config
  state.verbose = config.verbose

  const cliJsPath = __dirname
  const npmLibDir = path.join(cliJsPath, exhEnv === ExhEnv.REL ? '../' : '../../')

  const siteBuildDir = path.join(npmLibDir, 'site')
  const siteClientBuildDir = path.join(siteBuildDir, 'client')
  const siteServerBuildDir = path.join(siteBuildDir, 'server')

  const demoBuildOutputDir = config.demo.outDir // E.g. ./.exh/demo
  logStep(c => `Ensuring demo build output directory exists. Received: ${c.cyan(demoBuildOutputDir)}. Attempting: ${c.cyan(path.resolve(demoBuildOutputDir))}`, true)
  if (!fs.existsSync(demoBuildOutputDir))
    fs.mkdirSync(demoBuildOutputDir)

  const demoBuildOutputClientDir = path.join(demoBuildOutputDir, 'client') // E.g. ./.exh/demo/client
  const demoBuildOutputServerDir = path.join(demoBuildOutputDir, 'server') // E.g. ./.exh/demo/server
  const demoConfigDir = path.join(cliJsPath, 'demo-cmd-config-files')
  const siteClientDemoConfigDir = path.join(demoConfigDir, 'client')
  const siteServerDemoConfigDir = path.join(demoConfigDir, 'server')

  // Remove existing demo /client out dir
  fs.rmSync(demoBuildOutputClientDir, { recursive: true })
  // Remove existing demo /server out dir
  fs.rmSync(demoBuildOutputServerDir, { recursive: true })

  const error = await buildCompSite(config, demoBuildOutputDir)
  if (error != null)
    return error

  // -- Copy built Site Client and Site Server files to their corresponding demo out dir
  copySync(siteClientBuildDir, demoBuildOutputClientDir)
  copySync(siteServerBuildDir, demoBuildOutputServerDir)

  // -- Copy over Dockerfiles files
  copyFilesFromSrcDirToDestDir(siteClientDemoConfigDir, demoBuildOutputClientDir, ['Dockerfile'])
  copyFilesFromSrcDirToDestDir(siteServerDemoConfigDir, demoBuildOutputServerDir, ['Dockerfile'])

  // -- Copy over and modify nginx.conf file
  logStepHeader('Creating nginx.conf file', true)
  const nginxConfPath = path.join(siteClientDemoConfigDir, 'nginx.conf')
  logStep(c => `Reading nginx.conf file at ${c.cyan(nginxConfPath)}.`, true)
  const nginxConfText = fs.readFileSync(nginxConfPath, { encoding: 'utf8' })
  logStep('Applying configuration parameters to nginx.conf file.', true)
  const modifiedNginxConfText = modifyFileText(nginxConfText, {
    parameters: {
      'config.demo.httpsDomains': config.demo.httpsDomains.join(' '),
      'config.demo.httpsDomains0': config.demo.httpsDomains[0],
    },
    sectionToggles: {
      'config.demo.enableHttps': config.demo.enableHttps,
    },
  })
  const nginxConfOutPath = path.join(demoBuildOutputClientDir, 'nginx.conf')
  logStep(c => `Writing new nginx.conf file to ${c.cyan(nginxConfOutPath)}.`, true)
  fs.writeFileSync(nginxConfOutPath, modifiedNginxConfText)

  // -- Copy over and modify docker-compose.yaml file
  logStepHeader('Creating docker-compose configuration file', true)
  const dockerComposeYamlPath = path.join(demoConfigDir, 'docker-compose.yaml')
  logStep(c => `Reading in docker-compose configuration file at ${c.cyan(dockerComposeYamlPath)}.`, true)
  const dockerComposeYamlText = fs.readFileSync(dockerComposeYamlPath, { encoding: 'utf8' })
  logStep('Applying configuration parameters to docker-compose configuration file.', true)
  const modifiedDockerComposeYamlText = modifyFileText(dockerComposeYamlText, {
    parameters: {
      'config.demo.httpPort': config.demo.httpPort,
      'config.demo.httpsPort': config.demo.httpsPort,
      'config.demo.certDir': config.demo.certDir,
    },
    sectionToggles: {
      'config.demo.enableHttps': config.demo.enableHttps,
    },
  })
  const dockerComposeYamlOutPath = path.join(demoBuildOutputDir, 'docker-compose.yaml')
  logStep(c => `Writing new docker-compose configuration file to ${c.cyan(dockerComposeYamlOutPath)}.`, true)
  fs.writeFileSync(dockerComposeYamlOutPath, modifiedDockerComposeYamlText)

  // -- Copy over and modify docker-compose.certbot.yaml file
  logStepHeader('Creating docker-compose (certbot) configuration file', true)
  const dockerComposeCertbotYamlPath = path.join(demoConfigDir, 'docker-compose.certbot.yaml')
  logStep(c => `Reading in docker-compose (certbot) configuration file at ${c.cyan(dockerComposeCertbotYamlPath)}.`, true)
  const dockerComposeCertbotYamlText = fs.readFileSync(dockerComposeCertbotYamlPath, { encoding: 'utf8' })
  logStep('Applying configuration parameters to docker-compose (certbot) configuration file.', true)
  const modifiedDockerComposeCertbotYamlText = modifyFileText(dockerComposeCertbotYamlText, {
    parameters: {
      'config.demo.certDir': config.demo.certDir,
    },
  })
  const dockerComposeCertbotYamlOutPath = path.join(demoBuildOutputDir, 'docker-compose.certbot.yaml')
  logStep(c => `Writing new docker-compose (certbot) configuration file to ${c.cyan(dockerComposeCertbotYamlOutPath)}.`, true)
  fs.writeFileSync(dockerComposeCertbotYamlOutPath, modifiedDockerComposeCertbotYamlText)

  // -- Create the package.json file that contains only the parts needed to install Site Server dependencies
  createSiteServerPackageJsonForDocker(npmLibDir, demoBuildOutputServerDir)

  const prettyDemoBuildOutputDir = demoBuildOutputDir.replace(/\\/g, '/')
  const prettyDockerComposeFilePath = dockerComposeYamlOutPath.replace(/\\/g, '/')
  const prettyDockerComposeCertbotFilePath = dockerComposeCertbotYamlOutPath.replace(/\\/g, '/')

  logSuccess(c => `${c.green('Done!')} See output files at ${c.cyan(prettyDemoBuildOutputDir)}.`)
  logInfo(c => `If you first require a HTTPS certificate, you will first need to run the demo command with HTTPS disabled in config (${c.bold('demo.enableHttps = false')}), then run: ${c.bold(`docker compose -f ${prettyDockerComposeCertbotFilePath} run --rm certbot certonly --webroot --webroot-path /var/www/certbot/ -d ${config.demo.httpsDomains.join(',')}`)}`)
  logInfo(c => `Else if you already have a HTTPS certificate, then you can proceed by first building the docker images via running: ${c.bold(`docker compose -f ${prettyDockerComposeFilePath} build`)}`)
  logInfo(c => `Then run: ${c.bold(`docker compose -f ${prettyDockerComposeFilePath} up -d`)}`)
  logInfo(c => `Proceed with caution when modifying key configuration files such as ${c.cyan(prettyDockerComposeFilePath)} and ${c.cyan(path.join(demoBuildOutputClientDir, 'nginx.conf').replace(/\\/g, '/'))}.`)

  // TODO: This could either be made optional or somehow improved.
  // // -- Docker compose build and up commands
  // logStepHeader('Running docker compose build')
  // const dockerComposeFilePath = path.join(demoBuildOutputDir, 'docker-compose.yaml')
  // const proc = spawn('docker', ['compose', '-f', dockerComposeFilePath, 'build'])
  // enablePrettyProcessLogging(proc, 'docker compose build')

  // proc.on('exit', (code, signal) => {
  //   handleProcessExit(code, signal, 'docker compose build')

  //   logStepHeader('Running docker compose up', true)
  //   const proc2 = spawn('docker', ['compose', '-f', dockerComposeFilePath, 'up'])
  //   enablePrettyProcessLogging(proc2, 'docker compose up')
  // })

  return undefined
}, { exitWhenReturns: true })
