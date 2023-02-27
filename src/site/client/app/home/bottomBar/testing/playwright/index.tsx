import React, { useState } from 'react'

import Report from './report'
import StdOut from './stdOut'
import { useAppSelector } from '../../../../../store'
import Times from './times'
import LoadingCover from './loadingCover'
import Nav from '../../../../../../../ui-component-library/nav'
import { NavItemOptions } from '../../../../../../../ui-component-library/nav/types'

enum Page {
  REPORT,
  STD_OUT
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
