"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildExhIndexFile = exports.createBuilder = exports.printBuildResult = void 0;
/* eslint-disable import/no-extraneous-dependencies */
const esbuild = __importStar(require("esbuild"));
const esbuild_sass_plugin_1 = __importDefault(require("esbuild-sass-plugin"));
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const globsie_1 = __importDefault(require("globsie"));
const process_1 = require("process");
const prettyBytes_1 = __importDefault(require("./prettyBytes"));
const debouncedChokidar_1 = __importDefault(require("./debouncedChokidar"));
const paths_1 = require("./paths");
const BUILD_VERBOSITY = process.env.BUILD_VERBOSITY != null ? parseInt(process.env.BUILD_VERBOSITY) : 1;
/**
 * Prints the result of the given esbuild result to console.
 */
const printBuildResult = (result, startTime, additionalOutputs) => {
    const inputFileCount = Object.keys(result.metafile.inputs).length;
    const totalInputFileSizeBytes = Object.values(result.metafile.inputs).reduce((acc, input) => acc + input.bytes, 0);
    const totalOutputFileSizeBytes = Object.values(result.metafile.outputs).reduce((acc, output) => acc + output.bytes, 0);
    const outputFileCount = Object.keys(result.metafile.outputs).length;
    // Print input data
    console.log('  Inputs:');
    console.log(`    Input file count: ${inputFileCount} [${(0, prettyBytes_1.default)(totalInputFileSizeBytes)}]`);
    // Print output data
    console.log('  Outputs:');
    console.log(`    Output file count: ${outputFileCount} [${(0, prettyBytes_1.default)(totalOutputFileSizeBytes)}]`);
    if (BUILD_VERBOSITY > 0) {
        Object.entries(result.metafile.outputs).forEach(([filename, output]) => console.log(`    ${filename} [${(0, prettyBytes_1.default)(output.bytes)}]`));
        additionalOutputs === null || additionalOutputs === void 0 ? void 0 : additionalOutputs.forEach(o => console.log(`    ${path.relative(path.resolve('./'), o.path)} [${(0, prettyBytes_1.default)(o.sizeBytes)}]`));
    }
    // Metrics
    console.log('  Metrics:');
    if (BUILD_VERBOSITY > 0)
        console.log(`    Compression ratio: ${(totalInputFileSizeBytes / totalOutputFileSizeBytes).toFixed(2)}`);
    console.log(`    dt: ${(Date.now() - startTime)} ms`);
};
exports.printBuildResult = printBuildResult;
const createBuilder = (buildName, builder) => () => {
    process_1.stdout.write(`Building ${buildName}...`);
    const startTime = Date.now();
    return builder()
        .then(result => {
        process_1.stdout.write('Done.\n');
        (0, exports.printBuildResult)(result.buildResult, startTime, result.additionalOutputs);
        return result;
    })
        .catch(err => {
        console.log(err);
        return null;
    });
};
exports.createBuilder = createBuilder;
const prod = process.env.NODE_ENV === 'production';
const isTesting = process.env.IS_EXHIBITOR_TESTING === 'true';
const componentsBundleDirToComponentExhibitApiFilePath = path.relative(paths_1.COMPONENTS_BUNDLE_DIR, './src/api/componentExhibit');
fs.mkdirSync(paths_1.COMPONENTS_BUNDLE_DIR, { recursive: true });
const componentsBundleInputFilePath = path.join(paths_1.COMPONENTS_BUNDLE_DIR, paths_1.COMPONENTS_BUNDLE_INPUT_FILE_NAME);
const componentsBundleOutputFilePath = path.join(paths_1.COMPONENTS_BUNDLE_DIR, paths_1.COMPONENTS_BUNDLE_OUTPUT_FILE_NAME);
exports.buildExhIndexFile = (0, exports.createBuilder)('bundleInputBuilder', () => esbuild.build({
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
    plugins: [(0, esbuild_sass_plugin_1.default)()],
    loader: {
        '.ttf': 'file',
        '.woff': 'file',
        '.woff2': 'file',
    },
}).then(result => ({ buildResult: result })));
// ------------------------------------------------------------------------
// END BUILD UTILS
// ------------------------------------------------------------------------
const createComponentsBundleInputFile = async (configInclude) => {
    const includedFilePaths = await (0, globsie_1.default)(configInclude);
    const componentExhibitLines = includedFilePaths
        .map(_path => `export {} from '${path.relative(paths_1.COMPONENTS_BUNDLE_DIR, _path)}'`)
        .join('\n');
    const text = `import e from '${componentsBundleDirToComponentExhibitApiFilePath}'

${componentExhibitLines}

export default e`;
    fs.writeFileSync(componentsBundleInputFilePath, text);
};
// TODO: Temporary hard-coded values for testing purposes.
const DEFAULT_CONFIG_FILE_NAME = 'exh.config.json';
const TESTING_COMPONENT_LIBRARY_ROOT_DIR = './test/exampleComponentLibrary';
const rootDir = isTesting ? TESTING_COMPONENT_LIBRARY_ROOT_DIR : './';
const configFilePath = path.join(rootDir, DEFAULT_CONFIG_FILE_NAME);
const configString = fs.readFileSync(configFilePath, { encoding: 'utf8' });
const config = JSON.parse(configString);
const includeGlobPatterns = config.include.map(globPattern => path.join(rootDir, globPattern));
const iteration = async () => {
    await createComponentsBundleInputFile(includeGlobPatterns);
    await (0, exports.buildExhIndexFile)();
};
const main = async () => {
    await iteration();
    (0, debouncedChokidar_1.default)(() => {
        console.log('==> Rebuilding components...');
        iteration().then(() => {
            console.log('--> Done.');
        }).catch(() => undefined);
    }, includeGlobPatterns, 200, () => console.log('==> Watching for file changes...'));
};
console.log('==> Determining included files...');
(0, globsie_1.default)(includeGlobPatterns, {}).then(includedFilePaths => {
    console.log('--> Found ', includedFilePaths.length, 'files.');
    console.log('==> Creating components ts bundle input file...');
    createComponentsBundleInputFile(includedFilePaths);
    console.log('==> Building components ts bundle input file to js...');
    (0, exports.buildExhIndexFile)()
        .then(() => {
        console.log('==> Watching...');
        const watchGlobPattern = path.join(rootDir, '**/*');
        (0, debouncedChokidar_1.default)(() => {
            console.log('==> Rebuilding components...');
            createComponentsBundleInputFile(includedFilePaths);
            (0, exports.buildExhIndexFile)().then(() => {
                console.log('--> Done.');
            }).catch(() => undefined);
        }, [watchGlobPattern], 200, () => console.log('==> Watching for file changes...'));
    })
        .catch(() => (0, process_1.exit)(1));
});
