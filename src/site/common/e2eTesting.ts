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
  headless: boolean
}

export type PlaywrightTestResults = string
