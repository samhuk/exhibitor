const port: number = 4002

const config = {
  $schema: './schema.json',
  rootStyle: './styles.scss',
  site: {
    port,
    title: 'Test Component Library',
  },
  verbose: true,
}

export default config
