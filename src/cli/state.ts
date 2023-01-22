/**
 * Convenient global storage while a command executes. This can be useful for
 * state like verbosity.
 */
export const state: { verbose: boolean } = {
  verbose: false,
}

export const updateProcessVerbosity = (newVerbosity: boolean) => state.verbose = newVerbosity

export const getProcessVerbosity = () => state.verbose

export default state
