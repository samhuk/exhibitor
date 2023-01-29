type ProcessState = {
  verbose: boolean
  showIntercomLog: boolean
}

/**
 * Convenient global storage while a command executes. This can be useful for
 * state like verbosity.
 */
export const state: ProcessState = {
  verbose: false,
  showIntercomLog: false,
}

export const updateProcessVerbosity = (newVerbosity: boolean) => state.verbose = newVerbosity

export const getProcessVerbosity = () => state.verbose

export const updateProcessShowIntercomLog = (newValue: boolean) => state.showIntercomLog = newValue

export const getProcessShowIntercomLog = () => state.showIntercomLog

export default state
