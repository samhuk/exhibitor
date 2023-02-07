export type NodeProcessState = {
  verbose: boolean
}

/**
 * Convenient global state for node processes. This can be useful for
 * state like verbosity.
 */
const _state: NodeProcessState = {
  verbose: false,
}

const _globalThis = globalThis as any

const main = () => {
  if (_globalThis.state == null)
    _globalThis.state = _state
}

main()

export const state: NodeProcessState = _globalThis.state

export default state
