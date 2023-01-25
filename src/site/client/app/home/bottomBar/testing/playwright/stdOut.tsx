import React, { useMemo } from 'react'
import AnsiToHtml from 'ansi-to-html'

import { useAppSelector } from '../../../../../store'

const ansiColorsDark = {
  0: '#000',
  1: '#DB4C4C',
  2: '#0C0',
  3: '#C50',
  4: '#00C',
  5: '#C0C',
  6: '#0CC',
  7: '#CCC',
  8: '#555',
  9: '#F55',
  10: '#5F5',
  11: '#FF5',
  12: '#55F',
  13: '#F5F',
  14: '#5FF',
  15: '#FFF',
}

const ansiColorsLight = {
  0: '#000',
  1: '#C00',
  2: '#007A00',
  3: '#C50',
  4: '#00C',
  5: '#C0C',
  6: '#008E8E',
  7: '#CCC',
  8: '#555',
  9: '#F55',
  10: '#5F5',
  11: '#FF5',
  12: '#55F',
  13: '#F5F',
  14: '#5FF',
  15: '#FFF',
}

const escapeHTML = (text: string): string => (
  text.replace(/[&"<>]/g, c => ({ '&': '&amp;', '"': '&quot;', '<': '&lt;', '>': '&gt;' }[c]!))
)

export const render = () => {
  // const loadingState = useAppSelector(s => s.testing.playwright.loadingState)
  const stdOutList = useAppSelector(s => s.testing.playwright.results?.stdOutList)
  const theme = useAppSelector(s => s.theme.theme)

  const stdOutHtml = useMemo(() => {
    if (stdOutList == null)
      return null

    const fg = theme === 'dark' ? '#efefef' : '#222'
    const bg = theme === 'dark' ? '#222' : '#efefef'
    const colors = theme === 'dark' ? ansiColorsDark : ansiColorsLight

    return stdOutList.map((stdOut, i) => `<pre>${new AnsiToHtml({ bg, fg, colors }).toHtml(escapeHTML(stdOut))}</pre>`).join('')
  }, [stdOutList, theme])

  return (
    <div className="std-out">
      <div dangerouslySetInnerHTML={{ __html: stdOutHtml ?? '' }} />
    </div>
  )
}

export default render
