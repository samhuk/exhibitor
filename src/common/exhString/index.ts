import colors from 'colors/safe'
import { ExhString } from './types'

export const normalizeExhString = (s: ExhString): string => (
  typeof s === 'function'
    ? s(colors)
    : s
)
