import React from 'react'

import { ReportView } from '../../../../../../../external/playwright-html-reporter/src/reportView'
import { useAppSelector } from '../../../../../store'
import { playwrightTestReportService } from '../../../../../services/playwrightTestReportService'

const render = () => {
  const variantPath = useAppSelector(s => s.componentExhibits.selectedVariantPath)
  const reportItem = playwrightTestReportService.getByVariantPath(variantPath)
  return reportItem?.report != null ? <ReportView report={reportItem.report} /> : null
}

export default render
