import { DEFAULT_HEIGHT_PX } from './resizableEffect'

export type State = {
  heightPx: number
  isCollapsed: boolean
}

export const DEFAULT_STATE: State = { isCollapsed: false, heightPx: DEFAULT_HEIGHT_PX }

export const saveState = (state: State) => {
  const date = new Date().setFullYear(new Date().getFullYear() + 1)
  document.cookie = `bbar=${JSON.stringify(state)}; expires=${date}; path=/; SameSite=Lax`
}

export const restoreState = (): State => {
  const rawValue = document.cookie
    .split('; ')
    .find(row => row.startsWith('bbar='))
    ?.split('=')[1]
  if (rawValue == null)
    return DEFAULT_STATE
  try {
    const parsed = JSON.parse(rawValue) as State
    if (parsed == null || typeof parsed !== 'object')
      return DEFAULT_STATE

    return {
      isCollapsed: parsed.isCollapsed ?? DEFAULT_STATE.isCollapsed,
      heightPx: parsed.heightPx ?? DEFAULT_STATE.heightPx,
    }
  }
  catch {
    return DEFAULT_STATE
  }
}
