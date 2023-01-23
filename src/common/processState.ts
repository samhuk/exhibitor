/**
 * Convenient global storage for a node process. This can be useful for
 * process-wide state that doesn't really change like verbosity.
 */
export const state: { verbose: boolean } = {
  verbose: false,
}

export const updateProcessVerbosity = (newVerbosity: boolean) => state.verbose = newVerbosity

export const getProcessVerbosity = () => state.verbose

export default state
