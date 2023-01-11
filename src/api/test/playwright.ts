import { Page } from '@playwright/test'
import { VARIANT_PATH_ENV_VAR_NAME } from '../../common/testing'

export const preparePlaywrightTest = async (page: Page) => {
  const variantPath = process.env[VARIANT_PATH_ENV_VAR_NAME]

  // This will likely be because their tests are not being ran by Exhibitor
  if (variantPath == null)
    return false

  await page.goto(`http://localhost:4001/comp-site?path=${variantPath}`)
  await page.waitForTimeout(2000) // TODO: The comp-site needs to tell us when it's ready
  return true
}
