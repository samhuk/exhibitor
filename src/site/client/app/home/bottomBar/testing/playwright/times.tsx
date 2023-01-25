import React from 'react'

import { useAppSelector } from '../../../../../store'

export const render = () => {
  const dateStarted = useAppSelector(s => s.testing.playwright.dateLastStarted)
  const dateCompleted = useAppSelector(s => s.testing.playwright.dateLastCompleted)

  return (
    <div className="times">
      {dateStarted != null ? (
        <span className="started">
          <i className="fas fa-play" />
          <span className="text">{new Date(dateStarted).toLocaleTimeString()}</span>
        </span>
      ) : null}
      {dateCompleted != null ? (
        <span className="completed">
          <i className="fas fa-flag-checkered" />
          <span className="text">{new Date(dateCompleted).toLocaleTimeString()}</span>
        </span>
      ) : null}
      {dateCompleted != null ? (
        <span className="duration">
          <i className="far fa-hourglass" />
          <span className="text">{((dateCompleted - dateStarted) / 1000).toFixed(1)}s</span>
        </span>
      ) : null}
    </div>
  )
}

export default render
