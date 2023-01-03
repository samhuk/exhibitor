import React from 'react'
import { NPM_PACKAGE_CAPITALIZED_NAME } from '../../../../common/name'
import { useAppDispatch, useAppSelector } from '../../store'
import { incrementTheme } from '../../store/theme/actions'
import About from './about'

export const render = () => {
  const dispatch = useAppDispatch()
  const theme = useAppSelector(s => s.theme.theme)

  const onThemeButtonClick = () => {
    dispatch(incrementTheme())
  }

  return (
    <div className="exh-header">
      <div className="title">
        {NPM_PACKAGE_CAPITALIZED_NAME}
      </div>
      <div className="right">
        <About />
        <button type="button" onClick={onThemeButtonClick} title={theme === 'dark' ? 'Enable light theme' : 'Enable dark theme'}>
          <i className={`fas fa-${theme === 'dark' ? 'sun' : 'moon'}`} />
        </button>
      </div>
    </div>
  )
}

export default render
