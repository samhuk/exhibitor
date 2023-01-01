import { JsonViewer, JsonViewerProps, JsonViewerTheme } from '@textea/json-viewer'
import React from 'react'
import { useAppSelector } from '../store'

const themeToJsonViewerTheme: { [theme: string]: JsonViewerTheme } = {
  light: 'light',
  dark: 'dark',
}

export const render = (props: JsonViewerProps) => {
  const theme = useAppSelector(s => s.theme.theme)
  const jsonViewerTheme: JsonViewerTheme = themeToJsonViewerTheme[theme] ?? 'dark'

  return (
    <JsonViewer
      // eslint-disable-next-line react/jsx-props-no-spreading
      {...props}
      theme={jsonViewerTheme}
    />
  )
}

export default render
