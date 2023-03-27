import React from 'react'
import { NPM_PACKAGE_CAPITALIZED_NAME } from '../../../../common/name'
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
      This is a demo environment of {NPM_PACKAGE_CAPITALIZED_NAME}. It does not have all of the features
      of usual {NPM_PACKAGE_CAPITALIZED_NAME} enabled, such as source code change live-reloading and
      end-to-end Playwright component testing.
    </>
  )

  return isDemoMode
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
