import React from 'react'
import { NPM_PACKAGE_CAPITALIZED_NAME } from '../../../../common/name'
import Button from '../../../../ui-component-library/button'
import { useAppDispatch, useAppSelector } from '../../store'
import { incrementTheme } from '../../store/theme/actions'
import About from './about'
import BuildStatuses from './buildStatuses'
import Intercom from './intercom'

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
        <BuildStatuses />
        <Intercom />
        <About />
        <Button
          onClick={onThemeButtonClick}
          title={theme === 'dark' ? 'Light mode' : 'Dark mode'}
          icon={{ name: theme === 'dark' ? 'sun' : 'moon' }}
        />
      </div>
    </div>
  )
}

export default render
