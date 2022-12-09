import { eventLogService } from '../../services/eventLogService'
import { LoadingState } from '../types'
import {
  ADD_EVENT,
  BottomBarType,
  CHANGE_HAS_UNSEEN_EVENTS,
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
  selectedVariantPathFound: false,
  selectedBottomBarType: BottomBarType.Props,
  events: [],
  hasUnseenEvents: false,
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
        error: action.error,
        selectedVariantPath: state.selectedVariantPath,
        loadingState: action.error == null ? LoadingState.IDLE : LoadingState.FAILED,
        ready: true,
        selectedVariantPathFound: state.selectedVariantPathFound,
        selectedBottomBarType: state.selectedBottomBarType,
        hasUnseenEvents: state.hasUnseenEvents,
        events: [],
      }
    case SELECT_VARIANT:
      eventLogService.clear()
      return {
        error: state.error,
        loadingState: state.loadingState,
        ready: state.ready,
        selectedVariantPath: action.variantPath,
        selectedVariantPathFound: action.found,
        selectedBottomBarType: state.selectedBottomBarType,
        hasUnseenEvents: state.hasUnseenEvents,
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
    default:
      return state
  }
}
