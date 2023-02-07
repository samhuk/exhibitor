import React, { useState } from 'react'

import { NavItemOptions } from '../../../../../common/nav/types'
import Nav from '../../../../../common/nav'
import Report from './report'
import StdOut from './stdOut'
import { useAppSelector } from '../../../../../store'
import Times from './times'
import LoadingCover from './loadingCover'
import { LoadingState } from '../../../../../store/types'

enum Page {
  REPORT,
  STD_OUT
}

const ProgressEl = () => {
  const loadingState = useAppSelector(s => s.testing.playwright?.loadingState)
  const progressMessages = useAppSelector(s => s.testing.playwright?.progressMessages) ?? []
  if (loadingState !== LoadingState.FETCHING)
    return null

  return (
    <div className="progress">
      {progressMessages.map(msg => (
        <div className="msg">
          {msg}
        </div>
      ))}
    </div>
  )
}

const render = () => {
  const [page, setPage] = useState(Page.REPORT)
  const results = useAppSelector(s => s.testing.playwright.results)
  const navItemOptionsList: NavItemOptions[] = []

  if (results?.htmlReportData != null) {
    navItemOptionsList.push({
      iconName: 'square-poll-vertical',
      active: page === Page.REPORT,
      onClick: () => setPage(Page.REPORT),
      title: 'Report',
    })
  }

  if (results?.stdOutList != null) {
    navItemOptionsList.push({
      iconName: 'terminal',
      active: page === Page.STD_OUT,
      onClick: () => setPage(Page.STD_OUT),
      title: 'Terminal Output',
    })
  }

  return (
    <div className="playwright-results">
      <LoadingCover />
      <ProgressEl />
      <div className="header">
        <Nav navItems={navItemOptionsList} />
        <div className="right">
          <Times />
        </div>
      </div>
      {page === Page.REPORT
        ? <Report />
        : <StdOut />}
    </div>
  )
}

export default render
