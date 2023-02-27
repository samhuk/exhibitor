import React from 'react'
import Icon from '../../../../../../../ui-component-library/icon'

import { useAppSelector } from '../../../../../store'

export const render = () => {
  const dateStarted = useAppSelector(s => s.testing.playwright.dateLastStarted)
  const dateCompleted = useAppSelector(s => s.testing.playwright.dateLastCompleted)

  return (
    <div className="times">
      {dateStarted != null ? (
        <span className="started">
          <Icon iconName="play" />
          <span className="text">{new Date(dateStarted).toLocaleTimeString()}</span>
        </span>
      ) : null}
      {dateCompleted != null ? (
        <span className="completed">
          <Icon iconName="flag-checkered" />
          <span className="text">{new Date(dateCompleted).toLocaleTimeString()}</span>
        </span>
      ) : null}
      {dateCompleted != null ? (
        <span className="duration">
          <Icon iconName="hourglass" />
          <span className="text">{((dateCompleted - dateStarted) / 1000).toFixed(1)}s</span>
        </span>
      ) : null}
    </div>
  )
}

export default render
