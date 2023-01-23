import { get } from './core'

export const fetchExhibitCode = (exhibitSrcPath: string) => get<string>(
  'exhibit-code',
  {
    exhibitSrcPath,
  },
  { responseType: 'text' },
)
