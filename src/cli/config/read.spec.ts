import { readAndParseConfig } from './read'

describe('cli/config/read', () => {
  describe('readAndParseConfig', () => {
    const fn = readAndParseConfig

    test('json', async () => {
      const result = await fn('./src/cli/config/testConfig.json')
      expect(result).toEqual({
        $schema: './schema.json',
        rootStyle: './styles.scss',
        site: {
          port: 4002,
          title: 'Test Component Library',
        },
        verbose: true,
      })
    })

    test('js', async () => {
      const result = await fn('./src/cli/config/testConfig.js')
      expect(result).toEqual({
        rootStyle: './styles.scss',
        site: {
          port: 4002,
          title: 'Test Component Library',
        },
        verbose: true,
      })
    })

    // test('ts', async () => {
    //   const result = await fn('./src/cli/config/testConfig.ts')
    //   expect(result).toEqual({
    //     $schema: './schema.json',
    //     rootStyle: './styles.scss',
    //     site: {
    //       port: 4002,
    //       title: 'Test Component Library',
    //     },
    //     verbose: true,
    //   })
    // })
  })
})
