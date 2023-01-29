import { Page } from '@playwright/test'
import { VARIANT_PATH_ENV_VAR_NAME } from '../../common/testing'

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
