/**
 * Convenient global storage while a command executes. This can be useful for
 * state like verbose mode.
 */
export const state: { verbose: boolean } = {
  verbose: false,
}

export default state
