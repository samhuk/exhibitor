import { test, expect } from '@playwright/test'
import { preparePlaywrightTest } from '../../../src/api'

test('has title (should pass)', async ({ page }) => {
  await preparePlaywrightTest(page)

  const buttonEl = await page.$('.cl-button')
  const buttonTextContent = await buttonEl.textContent()

  // Expect a title "to contain" a substring.
  await expect(buttonTextContent).toBe('Button Text')
})

test('has title (should fail)', async ({ page }) => {
  await preparePlaywrightTest(page)

  const buttonEl = await page.$('.cl-button')
  const buttonTextContent = await buttonEl.textContent()

  // Expect a title "to contain" a substring.
  await expect(buttonTextContent).toBe('Not button text')
})
