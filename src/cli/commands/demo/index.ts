import path from 'path'
import * as fs from 'fs'
import { spawn } from 'child_process'
import { copySync } from 'fs-extra'

import { ExhEnv, getEnv } from '../../../common/env'
import { ExhError } from '../../../common/exhError/types'
import { baseCommand } from '../common'

const copyFilesFromSrcDirToDestDir = (srcDir: string, destDir: string, srcFileNames: string[]) => {
  for (let i = 0; i < srcFileNames.length; i += 1)
    fs.copyFileSync(path.join(srcDir, srcFileNames[i]), path.join(destDir, srcFileNames[i]))
}

export const demo = baseCommand('demo', async (): Promise<ExhError | null | undefined> => {
  const env = getEnv()

  const cliJsPath = __dirname
  const npmLibDir = path.join(cliJsPath, env === ExhEnv.REL ? '../' : '../../')

  const siteBuildDir = path.join(npmLibDir, 'site')
  const siteClientBuildDir = path.join(siteBuildDir, 'client')
  const siteServerBuildDir = path.join(siteBuildDir, 'server')

  const demoBuildOutputDir = './.exh/demo'
  const demoBuildOutputClientDir = path.join(demoBuildOutputDir, 'client')
  const demoBuildOutputServerDir = path.join(demoBuildOutputDir, 'server')

  const demoConfigDir = path.join(cliJsPath, 'demo-cmd-config-files')
  const siteClientDemoConfigDir = path.join(demoConfigDir, 'client')
  const siteServerDemoConfigDir = path.join(demoConfigDir, 'server')

  // Copy client and server build files to their corresponding demo dir
  copySync(siteClientBuildDir, demoBuildOutputClientDir)
  copySync(siteServerBuildDir, demoBuildOutputServerDir)

  // Copy over Docker-related (and other demo config) files
  copyFilesFromSrcDirToDestDir(siteClientDemoConfigDir, demoBuildOutputClientDir, ['Dockerfile', 'nginx.conf'])
  copyFilesFromSrcDirToDestDir(siteServerDemoConfigDir, demoBuildOutputServerDir, ['Dockerfile'])
  copyFilesFromSrcDirToDestDir(demoConfigDir, demoBuildOutputDir, ['docker-compose.yaml'])

  // Generate the package.json file that contains only the parts needed to install Site Server dependencies
  const packageJsonPath = env === ExhEnv.REL ? path.join(npmLibDir, '../package.json') : './dist/npm/exhibitor/package.json'
  const packageJsonText = fs.readFileSync(packageJsonPath, 'utf8')
  const packageInfo = JSON.parse(packageJsonText)
  const cliOnlyDeps = ['commander', 'esbuild', 'chokidar', 'chokidar-debounced', 'esbuild-sass-plugin']
  cliOnlyDeps.forEach(depName => delete packageInfo.dependencies[depName])
  const newPackageInfo = {
    dependencies: packageInfo.dependencies,
  }
  fs.writeFileSync(path.join(demoBuildOutputServerDir, 'package.json'), JSON.stringify(newPackageInfo, null, 2))

  const dockerComposeFilePath = path.join(demoBuildOutputDir, 'docker-compose.yaml')

  const proc = spawn('docker', ['compose', '-f', dockerComposeFilePath, 'build'])

  proc.stdout.on('data', data => {
    console.log('[build] STDOUT:', String(data))
  })

  proc.stderr.on('data', data => {
    console.log('[build] STDERR:', String(data))
  })

  proc.on('exit', (code, signal) => {
    console.log(`Command ended with code ${code} and signal "${signal}"`)

    if (code !== 0)
      process.exit(1)

    const proc2 = spawn('docker', ['compose', '-f', dockerComposeFilePath, 'up'])
    proc2.stdout.on('data', data => {
      console.log('[run] STDOUT:', String(data))
    })

    proc2.stderr.on('data', data => {
      console.log('[run] STDERR:', String(data))
    })
  })

  return undefined
}, { exitWhenReturns: false })
