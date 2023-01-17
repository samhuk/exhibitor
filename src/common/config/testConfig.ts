import { UnresolvedConfig } from './types'

const port: number = 4002

const config: UnresolvedConfig = {
  rootStyle: './styles.scss',
  site: {
    port,
    title: 'Test Component Library',
  },
  verbose: true,
}

export default config
