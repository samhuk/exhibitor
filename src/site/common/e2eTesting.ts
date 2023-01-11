// eslint-disable-next-line import/no-unresolved
import { JSONReport } from '@playwright/test/types/testReporter'

export type RunE2eTestOptions = {
  /**
   * @example './button.spec.ts'
   */
  testFilePath: string
  /**
   * @example 'src/componentLibrary/button/button.exh.ts'
   */
  exhibitSrcFilePath: string
  /**
   * @example 'Final Draft/Button/Red'
   */
  variantPath: string
  headed: boolean
}

export type PlaywrightTestResults = JSONReport
