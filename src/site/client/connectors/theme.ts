import { getCookieValue, setCookieValue } from './cookie'

import { THEMES } from '../../../common/theme'

const COOKIE_NAME = 'theme'

export const getTheme = () => getCookieValue(COOKIE_NAME) ?? THEMES[0]

export const saveTheme = (theme: string) => setCookieValue(COOKIE_NAME, theme)
