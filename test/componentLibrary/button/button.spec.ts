import { test, expect } from '@playwright/test'

test('has title', async ({ page }) => {
  await page.goto('http://localhost:4001/comp-site')

  await page.waitForTimeout(10000)

  // Expect a title "to contain" a substring.
  await expect(page).toHaveTitle('Test Component Library')
})
