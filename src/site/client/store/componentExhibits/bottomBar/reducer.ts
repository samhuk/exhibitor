import { APPLY_WORKING_VIEWPORT_SIZE, UPDATE_VIEWPORT_SIZE } from '../actions'
import {
  Actions,
  State,
  UPDATE_SELECTED_VIEWPORT_DIMENSION_PRESET_OPTION,
} from './actions'

const initialState: State = {
  selectedViewportDimensionPresetOption: undefined,
}

export const bottomBarReducer = (
  // eslint-disable-next-line default-param-last
  state = initialState,
  action: Actions,
): State => {
  switch (action.type) {
    case UPDATE_SELECTED_VIEWPORT_DIMENSION_PRESET_OPTION:
      return {
        selectedViewportDimensionPresetOption: action.option,
      }
    case UPDATE_VIEWPORT_SIZE as any:
      return {
        selectedViewportDimensionPresetOption: undefined,
      }
    case APPLY_WORKING_VIEWPORT_SIZE as any:
      return {
        selectedViewportDimensionPresetOption: undefined,
      }
    default:
      return state
  }
}
