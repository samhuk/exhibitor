import path from 'path'
import { BUILD_OUTPUT_ROOT_DIR } from '../../../../common/paths'

export const REQUIRED_PACKAGES = ['playwright-core/cli', '@playwright/test'] as const
export const PLAYWRIGHT_REPORTS_DIR = 'playwright-reports'
export const PLAYWRIGHT_REPORT_OUTFILENAME = 'index.html'
export const PLAYWRIGHT_REPORT_FILE = `${BUILD_OUTPUT_ROOT_DIR}/${PLAYWRIGHT_REPORTS_DIR}/data.txt` as const
export const PLAYWRIGHT_REPORT_HTML_FILE = `${BUILD_OUTPUT_ROOT_DIR}/${PLAYWRIGHT_REPORTS_DIR}/${PLAYWRIGHT_REPORT_OUTFILENAME}` as const
export const PLAYWRIGHT_BASE_CONFIG_FILE = `${BUILD_OUTPUT_ROOT_DIR}/playright-base-config.json` as const
export const PLAYWRIGHT_BASE_CONFIG_TEST_DIR = path.relative(BUILD_OUTPUT_ROOT_DIR, './') // I.e. ../
