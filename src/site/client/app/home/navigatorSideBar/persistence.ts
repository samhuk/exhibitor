import { determineIfWindowWidthIsAtOrAbove, WindowWidthType } from '../../../common/responsiveness'
import { getCookieValue, setCookieValue } from '../../../connectors/cookie'
import { NavBarState } from './types'

export const DEFAULT_WIDTH_PX = 300

const COOKIE_NAME = 'navbar'

export const getDefaultWidthPx = () => (determineIfWindowWidthIsAtOrAbove(WindowWidthType.SMALL_LAPTOP)
  ? DEFAULT_WIDTH_PX
  : DEFAULT_WIDTH_PX - 100)

const createDefaultState = (): NavBarState => ({
  expandedPaths: {},
  widthPx: getDefaultWidthPx(),
})

export const saveNavBarState = (state: NavBarState) => {
  setCookieValue(COOKIE_NAME, JSON.stringify(state))
}

export const restoreNavBarState = (): NavBarState => {
  const rawValue = getCookieValue(COOKIE_NAME)
  if (rawValue == null)
    return createDefaultState()
  try {
    const parsed = JSON.parse(rawValue) as NavBarState
    if (parsed == null || typeof parsed !== 'object')
      return createDefaultState()

    return {
      expandedPaths: parsed.expandedPaths ?? {},
      widthPx: parsed.widthPx ?? getDefaultWidthPx(),
    }
  }
  catch {
    return createDefaultState()
  }
}
