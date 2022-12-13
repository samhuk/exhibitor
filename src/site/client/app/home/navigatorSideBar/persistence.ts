import { DEFAULT_WIDTH_PX } from './resizableEffect'

export type NavBarState = {
  widthPx: number
  expandedPaths: { [path: string]: boolean }
}

export const saveNavBarState = (state: NavBarState) => {
  const date = new Date().setFullYear(new Date().getFullYear() + 1)
  document.cookie = `navbar=${JSON.stringify(state)}; expires=${date}; path=/; SameSite=Lax`
}

export const restoreNavBarState = (): NavBarState => {
  const rawValue = document.cookie
    .split('; ')
    .find(row => row.startsWith('navbar='))
    ?.split('=')[1]
  if (rawValue == null)
    return { expandedPaths: {}, widthPx: DEFAULT_WIDTH_PX }
  try {
    const parsed = JSON.parse(rawValue) as NavBarState
    if (parsed == null || typeof parsed !== 'object')
      return { expandedPaths: {}, widthPx: DEFAULT_WIDTH_PX }

    return {
      expandedPaths: parsed.expandedPaths ?? {},
      widthPx: parsed.widthPx ?? DEFAULT_WIDTH_PX,
    }
  }
  catch {
    return { expandedPaths: {}, widthPx: DEFAULT_WIDTH_PX }
  }
}
