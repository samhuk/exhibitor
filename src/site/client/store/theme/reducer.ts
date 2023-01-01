import {
  INCREMENT,
  SET,
  ThemeActions,
  ThemeState,
} from './actions'
import { DEFAULT_THEME, THEMES } from '../../../../common/theme'
import { saveTheme } from '../../connectors/theme'

const initialState: ThemeState = {
  theme: DEFAULT_THEME,
}

const applyNewThemeToIndexHtml = (theme: string) => {
  const el = document.querySelector('#styles-link') as any
  el.href = `/${theme}.css`
}

export const themeReducer = (
  // eslint-disable-next-line default-param-last
  state = initialState,
  action: ThemeActions,
): ThemeState => {
  switch (action.type) {
    case INCREMENT: {
      const currentThemeIndex = THEMES.indexOf(state.theme as any)
      const newThemeIndex = currentThemeIndex === THEMES.length - 1 ? 0 : currentThemeIndex + 1
      const newTheme = THEMES[newThemeIndex]

      applyNewThemeToIndexHtml(newTheme)
      saveTheme(newTheme)

      return {
        theme: THEMES[newThemeIndex],
      }
    }
    case SET:
      return {
        theme: action.theme,
      }
    default:
      return state
  }
}
