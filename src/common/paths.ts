/**
 * This is the directory where component exhibits build output files
 * are written to.
 */
export const BUILD_OUTPUT_ROOT_DIR = './.exh' as const
export const BUNDLE_INPUT_FILE_NAME = 'index.exh.ts' as const
export const BUNDLE_OUTPUT_FILE_NAME = 'index.exh.js' as const

export const DEFAULT_CONFIG_FILE_NAME = 'exh.config.json' as const
export const TEST_COMPONENT_LIBRARY_ROOT_DIR = './test/componentLibrary' as const

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

export const META_DATA_FILE_NAME = 'metadata.json' as const
export const META_DATA_FILE = `${BUILD_OUTPUT_ROOT_DIR}/${META_DATA_FILE_NAME}` as const
