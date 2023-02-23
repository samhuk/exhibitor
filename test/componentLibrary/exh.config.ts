const port: number = 4002

const config = {
  $schema: './schema.json',
  rootStyle: './styles/index-dark.scss',
  site: {
    port,
    title: 'Test Component Library',
  },
  verbose: true,
}

export default config
