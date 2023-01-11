/**
 * This file defines the public ("exported") Javascript API of exhibitor.
 * Things exposed here wil be available like:
 * ```
 * import exhibit, { ... } from 'exhibitor'
 * ```
 *
 * This is composed of functions like `exhibit()`.
 */
import { exhibit } from './exhibit'

export { preparePlaywrightTest } from './test/playwright'

export * from './types'

export default exhibit
