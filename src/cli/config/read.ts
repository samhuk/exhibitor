import * as fs from 'fs'
import path, { isAbsolute } from 'path'
import { pathToFileURL } from 'url'
import type { Service as TsNodeService } from 'ts-node'
import parseJson from '@samhuk/parse-json'
import stripJsonComments from '@samhuk/strip-json-comments'
import { Config } from './types'
import { logStep } from '../logging'

let registeredCompilerPromise: Promise<TsNodeService>

const interopRequireDefault = (obj: any): any => (
  obj && obj.__esModule ? obj : { default: obj }
)

async function createTsNodeService(): Promise<TsNodeService> {
  try {
    logStep('Importing ts-node', true)
    // Register TypeScript compiler instance
    const tsNode = await import('ts-node')
    logStep('Registering ts-node as a compiler for the Typescript config file(s)', true)
    return tsNode.register({
      compilerOptions: {
        module: 'CommonJS',
      },
      moduleTypes: {
        '**': 'cjs',
      },
    })
  }
  catch (e: any) {
    if (e.code === 'ERR_MODULE_NOT_FOUND') {
      throw new Error(
        `'ts-node' is required for the TypeScript configuration files. Make sure it is installed\nError: ${e.message}`,
      )
    }

    throw e
  }
}

const getTsNodeService = () => {
  // Cache to avoid multiple registrations
  registeredCompilerPromise = registeredCompilerPromise ?? createTsNodeService()
  return registeredCompilerPromise
}

const readTsConfig = async (
  configFilePath: string,
) => {
  // Get TypeScript compiler instance
  const tsCompiler = await getTsNodeService()

  tsCompiler.enabled(true)

  logStep('Compiling and importing Typescript config file(s)', true)
  // eslint-disable-next-line import/no-dynamic-require, global-require
  let configObject = interopRequireDefault(require(configFilePath)).default

  // In case the config is a function which imports more Typescript code
  if (typeof configObject === 'function') {
    logStep('Configuration was a function. Executing it.', true)
    configObject = await configObject()
  }

  tsCompiler.enabled(false)

  return configObject
}

const requireOrImportModule = async <T extends any>(
  filePath: string,
  applyInteropRequireDefault = true,
): Promise<T> => {
  if (!isAbsolute(filePath) && filePath[0] === '.')
    throw new Error(`requireOrImportModule path must be absolute, was "${filePath}"`)

  try {
    // eslint-disable-next-line import/no-dynamic-require, global-require
    const requiredModule = require(filePath)
    return applyInteropRequireDefault
      ? interopRequireDefault(requiredModule).default
      : requiredModule
  }
  catch (error: any) {
    if (error.code === 'ERR_REQUIRE_ESM') {
      try {
        const moduleUrl = pathToFileURL(filePath)

        // node `import()` supports URL, but TypeScript doesn't know that
        const importedModule = await import(moduleUrl.href)

        if (!applyInteropRequireDefault)
          return importedModule

        if (!importedModule.default) {
          throw new Error(
            `Failed to load ESM at ${filePath} - did you use a default export?`,
          )
        }

        return importedModule.default
      }
      catch (innerError: any) {
        if (innerError.message === 'Not supported') {
          throw new Error(
            `Your version of Node does not support dynamic import - please enable it or use a .cjs file extension for file ${filePath}`,
          )
        }
        throw innerError
      }
    }
    else {
      throw error
    }
  }
}

const readJsonConfig = (
  configFilePath: string,
) => {
  const configJson = fs.readFileSync(configFilePath, { encoding: 'utf8' })
  return parseJson(stripJsonComments(configJson), { fileName: configFilePath })
}

const getConfigObj = (
  configFilePath: string,
): Promise<Config> => {
  if (configFilePath.endsWith('.json')) {
    logStep('Configuration file is *.json. Parsing.', true)
    return readJsonConfig(configFilePath)
  }

  if (configFilePath.endsWith('.ts')) {
    logStep('Configuration file is *.ts. Executing.', true)
    return readTsConfig(configFilePath)
  }

  logStep('Configuration file is neither *.json or *.ts. Assuming is Javascript. Executing.', true)
  return requireOrImportModule(configFilePath)
}

const isFile = (filePath: string) => (
  fs.existsSync(filePath) && !fs.lstatSync(filePath).isDirectory()
)

const resolveConfigFilePath = (
  pathToResolve: string,
  cwd: string,
) => {
  if (!path.isAbsolute(cwd))
    throw new Error(`"cwd" must be an absolute path. cwd: ${cwd}`)

  const absolutePath = path.isAbsolute(pathToResolve)
    ? pathToResolve
    : path.resolve(cwd, pathToResolve)

  if (isFile(absolutePath))
    return absolutePath

  return null // TODO: CliError
}

/**
 * This is mostly a lift'n'shift from Jest.
 */
export const readAndParseConfig = async (
  configFilePath: string,
): Promise<Config> => {
  const resolvedConfigFilePath = resolveConfigFilePath(configFilePath, process.cwd())

  let configObj = await getConfigObj(resolvedConfigFilePath)

  if (resolvedConfigFilePath.endsWith('package.json')) {
    logStep('Configuration file path is a package.json file. Looking for \'.exhibitot\' property.', true)
    configObj = (configObj as any).exhibitor
  }

  if (typeof configObj === 'function') {
    logStep('Configuration is a function. Executing it.', true)
    configObj = await (configObj as Function)()
  }

  return configObj
}
