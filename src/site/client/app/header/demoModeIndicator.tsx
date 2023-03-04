import React from 'react'
import Tooltip from '../../../../ui-component-library/tooltip'
import { useAppSelector } from '../../store'

export const render = () => {
  const isDemoMode = useAppSelector(s => s.metaData.metaData?.isDemoMode)

  const referenceEl = (
    <>
      DEMO
    </>
  )

  const tooltipComponent = () => (
    <>
      This is a demo environment of Exhibitor. It does not have all of the features of usual Exhibitor
      enabled, such as source code change live-reloading and end-to-end Playwright component testing.
    </>
  )

  return !isDemoMode
    ? (
      <Tooltip
        referenceEl={referenceEl}
        tooltipEl={tooltipComponent}
        appearMode="hover"
        refClassName="demo-mode-indicator"
        tooltipClassName="demo-mode-indicator-tooltip"
        offset={{ y: 13 }}
      />
    )
    : null
}

export default render
