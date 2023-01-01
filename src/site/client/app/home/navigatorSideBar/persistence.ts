import { getCookieValue, setCookieValue } from '../../../connectors/cookie'
import { NavBarState } from './types'

export const DEFAULT_WIDTH_PX = 300

const COOKIE_NAME = 'navbar'

const DEFAULT_STATE: NavBarState = { expandedPaths: {}, widthPx: DEFAULT_WIDTH_PX }

export const saveNavBarState = (state: NavBarState) => {
  setCookieValue(COOKIE_NAME, JSON.stringify(state))
}

export const restoreNavBarState = (): NavBarState => {
  const rawValue = getCookieValue(COOKIE_NAME)
  if (rawValue == null)
    return DEFAULT_STATE
  try {
    const parsed = JSON.parse(rawValue) as NavBarState
    if (parsed == null || typeof parsed !== 'object')
      return DEFAULT_STATE

    return {
      expandedPaths: parsed.expandedPaths ?? {},
      widthPx: parsed.widthPx ?? DEFAULT_WIDTH_PX,
    }
  }
  catch {
    return DEFAULT_STATE
  }
}
