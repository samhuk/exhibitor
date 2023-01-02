import { eventLogService } from '../../services/eventLogService'
import { LoadingState } from '../types'
import {
  ADD_EVENT,
  BottomBarType,
  CHANGE_HAS_UNSEEN_EVENTS,
  CHANGE_VIEWPORT,
  TOGGLE_VIEWPORT_SIZE_CHANGE_ENABLED,
  ComponentExhibitsActions,
  ComponentExhibitsState,
  READY,
  SELECT_BOTTOM_BAR,
  SELECT_VARIANT,
} from './actions'

const initialState: ComponentExhibitsState = {
  error: null,
  loadingState: LoadingState.IDLE,
  ready: false,
  selectedVariantPath: null,
  selectedBottomBarType: BottomBarType.Props,
  events: [],
  hasUnseenEvents: false,
  viewportRectSizePx: null,
  viewportSizeChangeEnabled: false,
}

export const componentExhibitsReducer = (
  // eslint-disable-next-line default-param-last
  state = initialState,
  action: ComponentExhibitsActions,
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
    case CHANGE_VIEWPORT:
      return {
        ...state,
        viewportRectSizePx: action.viewportRectSizePx,
      }
    case TOGGLE_VIEWPORT_SIZE_CHANGE_ENABLED:
      return {
        ...state,
        viewportSizeChangeEnabled: !state.viewportSizeChangeEnabled,
      }
    default:
      return state
  }
}
