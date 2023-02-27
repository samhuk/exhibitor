import { UnresolvedConfig } from '../src/common/config/types'

const port: number = 4002

const config: UnresolvedConfig = {
  rootStyle: '../src/ui-component-library/assets/styles/index-dark.scss',
  site: {
    port,
    title: 'Test Component Library',
  },
  verbose: true,
}

export default config
