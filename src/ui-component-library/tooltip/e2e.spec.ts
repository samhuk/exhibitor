import { test, expect } from '@playwright/test'
import { CLASS_NAME } from '.'
import { preparePlaywrightTest } from '../../api'

test('Shows correct number for count', async ({ page }) => {
  await preparePlaywrightTest(page)

  const el = await page.$(`.${CLASS_NAME}`)
  const textContent = await el.textContent()

  await expect(textContent).toBe('Primary Button')
})
