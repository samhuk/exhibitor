import { Config } from 'jest'

const config: Config = {
  testEnvironment: 'jsdom', // TODO: We need to create two jest commands, one with node and one with jsdom.
  moduleNameMapper: {
    '^.+\\.(css|less|scss)$': 'babel-jest',
  },
  rootDir: './build-test',
  transform: {
    '^.+\\.[t|j]sx?$': ['babel-jest', { configFile: './jest.babelrc' }],
  },
  // This ensures that any node_modules packages that are ES6 modules don't break the unit tests
  transformIgnorePatterns: ['<rootDir>/node_modules/'],
  verbose: true,
}

export default config
