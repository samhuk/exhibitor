import { getCookieValue, setCookieValue } from './cookie'

const COOKIE_NAME = 'theme'

export const getTheme = () => getCookieValue(COOKIE_NAME)

export const saveTheme = (theme: string) => setCookieValue(COOKIE_NAME, theme)
