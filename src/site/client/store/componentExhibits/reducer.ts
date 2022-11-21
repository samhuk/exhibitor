import { LoadingState } from '../types'
import { READY, ComponentExhibitsActions, ComponentExhibitsState } from './actions'

const initialState: ComponentExhibitsState = {
  error: null,
  loadingState: LoadingState.IDLE,
  ready: false,
}

export const componentExhibitsReducer = (
  // eslint-disable-next-line default-param-last
  state = initialState,
  action: ComponentExhibitsActions,
): ComponentExhibitsState => {
  switch (action.type) {
    case READY:
      return {
        error: action.error,
        loadingState: action.error == null ? LoadingState.IDLE : LoadingState.FAILED,
        ready: true,
      }
    default:
      return state
  }
}
