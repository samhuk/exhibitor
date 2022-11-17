/* eslint-disable import/no-extraneous-dependencies */
import * as esbuild from 'esbuild'
import sassPlugin from 'esbuild-sass-plugin'
import * as fs from 'fs'
import * as path from 'path'
import glob from 'globsie'
import { exit, stdout } from 'process'
import prettyBytes from './prettyBytes'
import watch from './debouncedChokidar'
import { COMPONENTS_BUNDLE_DIR, COMPONENTS_BUNDLE_INPUT_FILE_NAME, COMPONENTS_BUNDLE_OUTPUT_FILE_NAME } from './paths'

export type BuildOutput = {
  path: string
  sizeBytes: number
}

export type CustomBuildResult = { buildResult: esbuild.BuildResult, additionalOutputs?: BuildOutput[] }

const BUILD_VERBOSITY = process.env.BUILD_VERBOSITY != null ? parseInt(process.env.BUILD_VERBOSITY) : 1

/**
 * Prints the result of the given esbuild result to console.
 */
export const printBuildResult = (result: esbuild.BuildResult, startTime: number, additionalOutputs?: BuildOutput[]) => {
  const inputFileCount = Object.keys(result.metafile.inputs).length
  const totalInputFileSizeBytes = Object.values(result.metafile.inputs).reduce((acc, input) => acc + input.bytes, 0)
  const totalOutputFileSizeBytes = Object.values(result.metafile.outputs).reduce((acc, output) => acc + output.bytes, 0)
  const outputFileCount = Object.keys(result.metafile.outputs).length
  // Print input data
  console.log('  Inputs:')
  console.log(`    Input file count: ${inputFileCount} [${prettyBytes(totalInputFileSizeBytes)}]`)
  // Print output data
  console.log('  Outputs:')
  console.log(`    Output file count: ${outputFileCount} [${prettyBytes(totalOutputFileSizeBytes)}]`)
  if (BUILD_VERBOSITY > 0) {
    Object.entries(result.metafile.outputs).forEach(([filename, output]) => console.log(`    ${filename} [${prettyBytes(output.bytes)}]`))
    additionalOutputs?.forEach(o => console.log(`    ${path.relative(path.resolve('./'), o.path)} [${prettyBytes(o.sizeBytes)}]`))
  }
  // Metrics
  console.log('  Metrics:')
  if (BUILD_VERBOSITY > 0)
    console.log(`    Compression ratio: ${(totalInputFileSizeBytes / totalOutputFileSizeBytes).toFixed(2)}`)
  console.log(`    dt: ${(Date.now() - startTime)} ms`)
}

export const createBuilder = (buildName: string, builder: () => Promise<CustomBuildResult>): () => Promise<CustomBuildResult> => () => {
  stdout.write(`Building ${buildName}...`)
  const startTime = Date.now()
  return builder()
    .then(result => {
      stdout.write('Done.\n')
      printBuildResult(result.buildResult, startTime, result.additionalOutputs)
      return result
    })
    .catch(err => {
      console.log(err)
      return null
    })
}

const prod = process.env.NODE_ENV === 'production'
const isTesting = process.env.IS_EXHIBITOR_TESTING === 'true'
const componentsBundleDirToComponentExhibitApiFilePath = path.relative(COMPONENTS_BUNDLE_DIR, './src/api/componentExhibit')

fs.mkdirSync(COMPONENTS_BUNDLE_DIR, { recursive: true })

const componentsBundleInputFilePath = path.join(COMPONENTS_BUNDLE_DIR, COMPONENTS_BUNDLE_INPUT_FILE_NAME)
const componentsBundleOutputFilePath = path.join(COMPONENTS_BUNDLE_DIR, COMPONENTS_BUNDLE_OUTPUT_FILE_NAME)

export const buildExhIndexFile = createBuilder('bundleInputBuilder', () => esbuild.build({
  entryPoints: [componentsBundleInputFilePath],
  outfile: componentsBundleOutputFilePath,
  platform: 'browser',
  format: 'iife',
  globalName: 'exh',
  bundle: true,
  minify: prod,
  sourcemap: !prod,
  metafile: true,
  incremental: !prod,
  plugins: [sassPlugin() as unknown as esbuild.Plugin],
  loader: {
    '.ttf': 'file',
    '.woff': 'file',
    '.woff2': 'file',
  },
}).then(result => ({ buildResult: result })))

// ------------------------------------------------------------------------
// END BUILD UTILS
// ------------------------------------------------------------------------

const createComponentsBundleInputFile = async (
  configInclude: string[],
) => {
  const includedFilePaths = await glob(configInclude)
  const componentExhibitLines = includedFilePaths
    .map(_path => `export {} from '${path.relative(COMPONENTS_BUNDLE_DIR, _path)}'`)
    .join('\n')

  const text = `import e from '${componentsBundleDirToComponentExhibitApiFilePath}'

${componentExhibitLines}

export default e`
  fs.writeFileSync(componentsBundleInputFilePath, text)
}

type Config = { include: string[] }

// TODO: Temporary hard-coded values for testing purposes.
const DEFAULT_CONFIG_FILE_NAME = 'exh.config.json'
const TESTING_COMPONENT_LIBRARY_ROOT_DIR = './test/exampleComponentLibrary'

const rootDir = isTesting ? TESTING_COMPONENT_LIBRARY_ROOT_DIR : './'
const configFilePath = path.join(rootDir, DEFAULT_CONFIG_FILE_NAME)
const configString = fs.readFileSync(configFilePath, { encoding: 'utf8' })
const config = JSON.parse(configString) as Config

const includeGlobPatterns = config.include.map(globPattern => path.join(rootDir, globPattern))

const iteration = async () => {
  await createComponentsBundleInputFile(includeGlobPatterns)
  await buildExhIndexFile()
}

const main = async () => {
  await iteration()
  watch(() => {
    console.log('==> Rebuilding components...')
    iteration().then(() => {
      console.log('--> Done.')
    }).catch(() => undefined)
  }, includeGlobPatterns, 200, () => console.log('==> Watching for file changes...'))
}

console.log('==> Determining included files...')
glob(includeGlobPatterns, {}).then(includedFilePaths => {
  console.log('--> Found ', includedFilePaths.length, 'files.')
  console.log('==> Creating components ts bundle input file...')
  createComponentsBundleInputFile(includedFilePaths)

  console.log('==> Building components ts bundle input file to js...')
  buildExhIndexFile()
    .then(() => {
      console.log('==> Watching...')
      const watchGlobPattern = path.join(rootDir, '**/*')
      watch(() => {
        console.log('==> Rebuilding components...')
        createComponentsBundleInputFile(includedFilePaths)
        buildExhIndexFile().then(() => {
          console.log('--> Done.')
        }).catch(() => undefined)
      }, [watchGlobPattern], 200, () => console.log('==> Watching for file changes...'))
    })
    .catch(() => exit(1))
})
