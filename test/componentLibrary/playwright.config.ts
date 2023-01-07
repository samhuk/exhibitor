import { PlaywrightTestConfig } from '@playwright/test'

const config: PlaywrightTestConfig = {
  use: {
    headless: false,
    viewport: { width: 1280, height: 720 },
    video: 'on-first-retry',
  },
}

export default config
