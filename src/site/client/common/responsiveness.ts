export enum WindowWidthType {
  MOBILE = 0,
  TABLET = 1,
  SMALL_LAPTOP = 2,
  DESKTOP = 3,
  LARGE_DESKTOP = 4,
}

export type WindowWidthInfo = {
  type: WindowWidthType
  displayName: string
  widthPx: number
}

export const WINDOW_WIDTH_TYPE_MAXIMA = {
  [WindowWidthType.MOBILE]: 480,
  [WindowWidthType.TABLET]: 768,
  [WindowWidthType.SMALL_LAPTOP]: 1024,
  [WindowWidthType.DESKTOP]: 1200,
  [WindowWidthType.LARGE_DESKTOP]: Infinity,
}

export const WINDOW_WIDTH_TYPE_DISPLAY_NAMES = {
  [WindowWidthType.MOBILE]: 'Mobile',
  [WindowWidthType.TABLET]: 'Tablet',
  [WindowWidthType.SMALL_LAPTOP]: 'Small Laptop',
  [WindowWidthType.DESKTOP]: 'Desktop',
  [WindowWidthType.LARGE_DESKTOP]: 'Large Desktop',
}

export const ORDERED_WINDOW_WIDTH_TYPES = Object.entries(WINDOW_WIDTH_TYPE_MAXIMA)
  .sort((e1, e2) => e1[1] - e2[1])
  .map(e => Number.parseInt(e[0])) as WindowWidthType[]

const numWindowWidthTypes = ORDERED_WINDOW_WIDTH_TYPES.length

export const determineWindowWidthType = (_window?: Window): WindowWidthType | null => {
  const __window = _window ?? window

  if (__window == null)
    return null

  const windowInnerWidth = __window.innerWidth
  for (let i = 0; i < numWindowWidthTypes; i += 1) {
    const windowWidthType = ORDERED_WINDOW_WIDTH_TYPES[i]
    const windowWidthTypeMaximum = WINDOW_WIDTH_TYPE_MAXIMA[windowWidthType]
    if (windowInnerWidth <= windowWidthTypeMaximum)
      return windowWidthType
  }
  return ORDERED_WINDOW_WIDTH_TYPES[numWindowWidthTypes - 1]
}

export const determineWidthWidthInfo = (_window?: Window): WindowWidthInfo | null => {
  if (_window == null)
    return null

  const __window = _window ?? window

  if (__window == null)
    return null

  const windowInnerWidth = __window.innerWidth
  for (let i = 0; i < numWindowWidthTypes; i += 1) {
    const windowWidthType = ORDERED_WINDOW_WIDTH_TYPES[i]
    const windowWidthTypeMaximum = WINDOW_WIDTH_TYPE_MAXIMA[windowWidthType]
    if (windowInnerWidth <= windowWidthTypeMaximum)
      return { type: windowWidthType, widthPx: windowInnerWidth, displayName: WINDOW_WIDTH_TYPE_DISPLAY_NAMES[windowWidthType] }
  }

  const typeWithMostWidth = ORDERED_WINDOW_WIDTH_TYPES[numWindowWidthTypes - 1]
  return { type: typeWithMostWidth, widthPx: windowInnerWidth, displayName: WINDOW_WIDTH_TYPE_DISPLAY_NAMES[typeWithMostWidth] }
}

export const determineIfWindowWidthIsAtOrBelow = (maxWindowWidthType: WindowWidthType, _window?: Window) => {
  const widthType = determineWidthWidthInfo(_window).type
  return widthType <= maxWindowWidthType
}

export const determineIfWindowWidthIsAtOrAbove = (minWindowWidthType: WindowWidthType, _window?: Window) => {
  const widthType = determineWidthWidthInfo(_window).type
  return widthType >= minWindowWidthType
}
