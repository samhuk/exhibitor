import { get } from './core'

export const fetchExhibitCode = (exhibitSrcPath: string) => get<string>(
  'exhibitCode',
  {
    exhibitSrcPath,
  },
)
