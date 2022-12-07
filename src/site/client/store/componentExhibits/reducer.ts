import { LoadingState } from '../types'
import { READY, ComponentExhibitsActions, ComponentExhibitsState, SELECT_VARIANT, BottomBarType, SELECT_BOTTOM_BAR } from './actions'

const initialState: ComponentExhibitsState = {
  error: null,
  loadingState: LoadingState.IDLE,
  ready: false,
  selectedVariantPath: null,
  selectedVariantPathFound: false,
  selectedBottomBarType: BottomBarType.Props,
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
        selectedVariantPath: state.selectedVariantPath,
        loadingState: action.error == null ? LoadingState.IDLE : LoadingState.FAILED,
        ready: true,
        selectedVariantPathFound: state.selectedVariantPathFound,
        selectedBottomBarType: state.selectedBottomBarType,
      }
    case SELECT_VARIANT:
      return {
        error: state.error,
        loadingState: state.loadingState,
        ready: state.ready,
        selectedVariantPath: action.variantPath,
        selectedVariantPathFound: action.found,
        selectedBottomBarType: state.selectedBottomBarType,
      }
    case SELECT_BOTTOM_BAR:
      return {
        ...state,
        selectedBottomBarType: action.barType,
      }
    default:
      return state
  }
}
