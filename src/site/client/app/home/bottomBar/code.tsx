import React from 'react'
import SyntaxHighlighter from 'react-syntax-highlighter'
import { vs2015, googlecode } from 'react-syntax-highlighter/dist/esm/styles/hljs'

import { ComponentExhibit, Variant } from '../../../../../api/exhibit/types'
import { useAppDispatch, useAppSelector } from '../../../store'
import { fetchExhibitCodeThunk } from '../../../store/componentExhibits/exhibitCode/reducer'

export const render = (props: {
  exhibit: ComponentExhibit<true>
  variant: Variant
}) => {
  const dispatch = useAppDispatch()
  const theme = useAppSelector(s => s.theme.theme)
  const state = useAppSelector(s => s.exhibitCode)
  if (state.doFetch)
    dispatch(fetchExhibitCodeThunk(props.exhibit.srcPath))

  const language = props.exhibit.srcPath.endsWith('ts') || props.exhibit.srcPath.endsWith('tsx') ? 'typescript' : 'javascript'

  return (
    <div className="code">
      <div className="path">
        {props.exhibit.srcPath}
      </div>
      <SyntaxHighlighter language={language} style={theme === 'dark' ? vs2015 : googlecode} showLineNumbers>
        {state.exhibitCode}
      </SyntaxHighlighter>
    </div>
  )
}

export default render
