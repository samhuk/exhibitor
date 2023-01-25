export type RunPlaywrightTestsOptions = {
  /**
   * @example './button.spec.ts'
   */
  testFilePath: string
  /**
   * @example 'src/componentLibrary/button/button.exh.ts'
   */
  exhibitSrcFilePath: string
  /**
   * @example 'Final%20Draft/Button/Red'
   */
  variantPath: string
  /**
   * Determines whether the test(s) will be ran in headless mode or not.
   */
  headless: boolean
}

export type RunPlayrightTestsResponse = {
  variantPath: string
  htmlReportData: string | null
  stdOutList: string[]
}

export type PlaywrightTestResults = string
