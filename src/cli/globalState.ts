export type GlobalState = {
  verbose: boolean
}

const state: GlobalState = {
  verbose: false,
}

export const setVerbosity = (newValue: boolean) => {
  state.verbose = newValue
}

export const getVerbosity = () => state.verbose
