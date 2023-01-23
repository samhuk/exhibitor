import colors from 'colors/safe'

export type Colors = typeof colors

export type ExhString = string | ((c: Colors) => string)
