import { useAppDispatch, useAppSelector } from '../../store'

import About from './about'
import BuildStatuses from './buildStatuses'
import Button from '../../../../ui-component-library/button'
import DemoModeIndicator from './demoModeIndicator'
import Intercom from './intercom'
import { NPM_PACKAGE_CAPITALIZED_NAME } from '../../../../common/name'
// eslint-disable-next-line import/order
import React from 'react'
import { incrementTheme } from '../../store/theme/actions'

export const render = () => {
  const dispatch = useAppDispatch()
  const theme = useAppSelector(s => s.theme.theme)
  const isIntercomEnabled = useAppSelector(s => s.intercom.enabled)

  const onThemeButtonClick = () => {
    dispatch(incrementTheme())
  }

  return (
    <div className="exh-header">
      <div className="title">
        {NPM_PACKAGE_CAPITALIZED_NAME}
      </div>
      <div className="right">
        <DemoModeIndicator />
        {isIntercomEnabled
          ? (
            <>
              <BuildStatuses />
              <Intercom />
            </>
          ) : null}
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
