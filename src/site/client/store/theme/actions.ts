export const INCREMENT = 'theme/increment'

export const SET = 'theme/set'

export type ThemeState = {
  theme: string
}

type IncrementThemeAction = {
  type: typeof INCREMENT
}

type SetThemeAction = {
  type: typeof SET
  theme: string
}

export type ThemeActions = IncrementThemeAction | SetThemeAction

export const incrementTheme = (): ThemeActions => ({
  type: INCREMENT,
})

export const setTheme = (theme: string): ThemeActions => ({
  type: SET,
  theme,
})
