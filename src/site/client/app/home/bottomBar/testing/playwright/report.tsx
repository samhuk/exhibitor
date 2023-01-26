import React from 'react'

import { ReportView } from '../../../../../../../external/playwright-html-reporter/src/reportView'
import { useAppSelector } from '../../../../../store'
import { playwrightTestReportService } from '../../../../../services/playwrightTestReportService'
import ErrorIcon from '../../../../../common/testReporting/errorIcon'

const render = () => {
  const variantPath = useAppSelector(s => s.componentExhibits.selectedVariantPath)
  const nonTestErrorCount = useAppSelector(s => s.testing.playwright?.results?.nonTestErrorCount)
  const reportItem = playwrightTestReportService.getByVariantPath(variantPath)
  const numTests = reportItem?.report?.json()?.files?.length

  if (reportItem != null && numTests === 0 && nonTestErrorCount > 0) {
    return (
      <div className="non-test-errors-notice">
        <ErrorIcon />
        {nonTestErrorCount === 1 ? 'An error occured ' : 'Errors occured '}
        that {nonTestErrorCount === 1 ? 'was' : 'were'} not part of any test, preventing them from running. See Terminal Output for details.
      </div>
    )
  }

  return reportItem?.report != null ? <ReportView report={reportItem.report} /> : null
}

export default render
