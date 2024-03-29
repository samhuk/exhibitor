/**
 * This is the directory where component exhibits build output files
 * are written to.
 */
export const BUILD_OUTPUT_ROOT_DIR = './.exh' as const
export const BUNDLE_INPUT_FILE_NAME = 'index.exh.ts' as const
export const BUNDLE_OUTPUT_FILE_NAME = 'index.exh.js' as const

export const DEFAULT_CONFIG_FILE_NAME = 'exh.config.json' as const
export const TEST_COMPONENT_LIBRARY_ROOT_DIR = './test' as const

// -- Site
export const SITE_CLIENT_DIR = './src/site/client' as const
export const SITE_COMMON_DIR = './src/site/common' as const
export const SITE_SERVER_DIR = './src/site/server' as const

export const SITE_CLIENT_ENTRYPOINT = `${SITE_CLIENT_DIR}/main.tsx` as const
export const SITE_CLIENT_FAVICON_PATH = `${SITE_CLIENT_DIR}/favicon.ico` as const
export const SITE_CLIENT_HTML_PATH = `${SITE_CLIENT_DIR}/index.html` as const
export const SITE_SERVER_ENTRYPOINT = `${SITE_SERVER_DIR}/index.ts` as const

export const SITE_CLIENT_OUTDIR = './build/site/client' as const
export const SITE_SERVER_OUTDIR = './build/site/server' as const
export const SITE_SERVER_OUTFILE = `${SITE_SERVER_OUTDIR}/index.js` as const

export const SITE_SERVER_BUILD_DIR_TO_CLIENT_BUILD_DIR_REL_PATH = '../client' as const

// -- Component Site (React)
export const COMP_SITE_REACT_DIR = './src/comp-site/react' as const
export const COMP_SITE_REACT_SITE_DIR = `${COMP_SITE_REACT_DIR}/site` as const
export const COMP_SITE_REACT_ENTRYPOINT = `${COMP_SITE_REACT_SITE_DIR}/main.tsx` as const
export const COMP_SITE_REACT_HTML_PATH = `${COMP_SITE_REACT_SITE_DIR}/index.html` as const
export const COMP_SITE_REACT_BUILD_DIR = `${COMP_SITE_REACT_DIR}/build` as const
export const COMP_SITE_REACT_BUILD_ENTRYPOINT = `${COMP_SITE_REACT_BUILD_DIR}/bin/build.ts` as const
export const COMP_SITE_REACT_OUTDIR = './build/comp-site/react' as const
export const COMP_SITE_REACT_SITE_PREBUILD_OUTDIR = `${COMP_SITE_REACT_OUTDIR}/site-prebuild` as const
export const COMP_SITE_REACT_BUILD_OUTFILE = `${COMP_SITE_REACT_OUTDIR}/build/index.js` as const

// -- Component Site (All)
export const COMP_SITE_OUTDIR = `${BUILD_OUTPUT_ROOT_DIR}/comp-site` as const

// -- Metadata file
export const META_DATA_FILE_NAME = 'metadata.json' as const
export const META_DATA_FILE = `${BUILD_OUTPUT_ROOT_DIR}/${META_DATA_FILE_NAME}` as const

// -- Playwright testing
export const PLAYWRIGHT_HTML_REPORTER_CODE_CLONE_DIR = './src/external/playwright-html-reporter' as const
