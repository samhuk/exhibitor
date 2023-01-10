import { test, expect } from '@playwright/test'

test('has title', async ({ page }) => {
  await page.goto('http://localhost:4001/comp-site?path=Button/blue')

  await page.waitForTimeout(1000)

  const buttonEl = await page.$('.cl-button')
  const buttonTextContent = await buttonEl.textContent()

  // Expect a title "to contain" a substring.
  await expect(buttonTextContent).toBe('Button Text')
})
