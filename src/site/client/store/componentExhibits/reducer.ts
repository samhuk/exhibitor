import { Size } from '../../../../common/geometry'
import { eventLogService } from '../../services/eventLogService'
import { LoadingState } from '../types'
import {
  ADD_EVENT,
  BottomBarType,
  CHANGE_HAS_UNSEEN_EVENTS,
  UPDATE_VIEWPORT_SIZE,
  TOGGLE_VIEWPORT_SIZE_CHANGE_ENABLED,
  ComponentExhibitsActions,
  ComponentExhibitsState,
  READY,
  SELECT_BOTTOM_BAR,
  SELECT_VARIANT,
  APPLY_WORKING_VIEWPORT_SIZE,
  UPDATE_WORKING_VIEWPORT_SIZE,
  SWAP_VIEWPORT_DIMENSIONS,
} from './actions'
import {
  Actions as BottomBarActions,
  UPDATE_SELECTED_VIEWPORT_DIMENSION_PRESET_OPTION,
} from './bottomBar/actions'

const initialState: ComponentExhibitsState = {
  error: null,
  loadingState: LoadingState.IDLE,
  ready: false,
  selectedVariantPath: null,
  selectedBottomBarType: BottomBarType.Props,
  events: [],
  hasUnseenEvents: false,
  viewportRectSizePx: { height: 300, width: 300 },
  workingViewportRectSizePx: { height: 300, width: 300 },
  viewportSizeChangeEnabled: false,
  exhibitCode: null,
}

export const componentExhibitsReducer = (
  // eslint-disable-next-line default-param-last
  state = initialState,
  action: ComponentExhibitsActions | BottomBarActions,
): ComponentExhibitsState => {
  switch (action.type) {
    case READY:
      eventLogService.clear()
      return {
        ...state,
        error: action.error,
        loadingState: action.error == null ? LoadingState.IDLE : LoadingState.FAILED,
        ready: true,
        events: [],
      }
    case SELECT_VARIANT:
      eventLogService.clear()
      document.getElementsByTagName('iframe')[0]?.contentWindow.dispatchEvent(new CustomEvent('selected-variant-change'))
      return {
        ...state,
        selectedVariantPath: action.variantNodePath,
        events: [],
      }
    case SELECT_BOTTOM_BAR:
      return {
        ...state,
        selectedBottomBarType: action.barType,
        hasUnseenEvents: action.barType === BottomBarType.EventLog ? false : state.hasUnseenEvents,
      }
    case ADD_EVENT:
      return {
        ...state,
        events: state.events.concat(action.id),
        hasUnseenEvents: state.selectedBottomBarType !== BottomBarType.EventLog,
      }
    case CHANGE_HAS_UNSEEN_EVENTS:
      return {
        ...state,
        hasUnseenEvents: action.hasUnseenEvents,
      }
    case UPDATE_VIEWPORT_SIZE:
      return {
        ...state,
        viewportRectSizePx: action.viewportRectSizePx,
        workingViewportRectSizePx: action.viewportRectSizePx,
      }
    case TOGGLE_VIEWPORT_SIZE_CHANGE_ENABLED:
      return {
        ...state,
        viewportSizeChangeEnabled: !state.viewportSizeChangeEnabled,
      }
    case UPDATE_WORKING_VIEWPORT_SIZE:
      return {
        ...state,
        workingViewportRectSizePx: action.viewportRectSizePx,
      }
    case APPLY_WORKING_VIEWPORT_SIZE:
      return {
        ...state,
        viewportRectSizePx: state.workingViewportRectSizePx,
      }
    case SWAP_VIEWPORT_DIMENSIONS: {
      const newViewportRectSizePx: Size = {
        height: state.viewportRectSizePx.width,
        width: state.viewportRectSizePx.height,
      }
      return {
        ...state,
        viewportRectSizePx: newViewportRectSizePx,
        workingViewportRectSizePx: newViewportRectSizePx,
      }
    }
    case UPDATE_SELECTED_VIEWPORT_DIMENSION_PRESET_OPTION: {
      const newViewportRectSizePx: Size = {
        width: action.option.value[0],
        height: action.option.value[1],
      }
      return {
        ...state,
        viewportRectSizePx: newViewportRectSizePx,
        workingViewportRectSizePx: newViewportRectSizePx,
      }
    }
    default:
      return state
  }
}
