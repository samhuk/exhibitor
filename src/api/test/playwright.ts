import { Page } from '@playwright/test'
import { VARIANT_PATH_ENV_VAR_NAME } from '../../common/testing'

/**
 * Prepares a Playwright page for testing a component variant. Call this
 * at the start of your e2e test function.
 *
 * @example
 * // button.spec.ts
 * import { test, expect } from '@playwright/test'
 * import { preparePlaywrightTest } from 'exhibitor'
 *
 * test('has title (should pass)', async ({ page }) => {
 *   // This ensures that the browser page shows the correct component
 *   await preparePlaywrightTest(page)
 *   // Find the component
 *   const buttonEl = await page.$('.cl-button')
 *   // Measure a value/behavoir
 *   const buttonTextContent = await buttonEl.textContent()
 *   // Assert measured value/behavoir is correct
 *   await expect(buttonTextContent).toBe('Button Text')
 * })
 */
export const preparePlaywrightTest = async (page: Page) => {
  const variantPath = process.env[VARIANT_PATH_ENV_VAR_NAME]

  // This will likely be because their tests are not being ran by Exhibitor
  if (variantPath == null)
    return false

  // TODO: This should reference constants. Busy at the moment...
  await page.goto(`http://${process.env.EXH_SITE_SERVER_HOST}:${process.env.EXH_SITE_SERVER_PORT}/comp-site?path=${variantPath}`)
  await page.waitForTimeout(2000) // TODO: The comp-site needs to tell us when it's ready
  return true
}
