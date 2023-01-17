/**
 * Convenient global storage while a command executes. This can be useful for
 * state like verbose mode.
 */
export const state: { verbose: boolean } = {
  verbose: false,
}

export const updateProcessVerbosity = (newVerbosity: boolean) => state.verbose = newVerbosity

export default state
