import React from 'react'
import { Data64URIReader, Entry, TextWriter, ZipReader } from '@zip.js/zip.js'
import { ReportView } from '../../../../../../external/playwright-html-reporter/src/reportView'

import { VariantExhibitNode } from '../../../../../../api/exhibit/types'
import { RunE2eTestOptions } from '../../../../../common/e2eTesting'
import RunButton from '../../../../common/buttons/runButton'
import ExternalLink from '../../../../common/text/externalLink'
import { useAppDispatch, useAppSelector } from '../../../../store'
import { runE2eTestThunk } from '../../../../store/componentExhibits/e2eTesting/reducer'
import { LoadingState } from '../../../../store/types'
import PlaywrightTestResults from './playwrightTestResults'

const RunButtonEl = (props: {
  variantNode: VariantExhibitNode
}) => {
  const dispatch = useAppDispatch()
  const variantPath = useAppSelector(s => s.componentExhibits.selectedVariantPath)
  const onClick = () => {
    const options: RunE2eTestOptions = {
      exhibitSrcFilePath: props.variantNode.exhibit.srcPath,
      headed: true,
      testFilePath: props.variantNode.exhibit.testSrcPath,
      variantPath,
    }
    dispatch(runE2eTestThunk(options))
  }
  return <RunButton onClick={onClick} title="Run Tests" />
}

const LoadingEl = () => (
  <div className="loading">Running...</div>
)

const HeaderEl = (props: {
  variantNode: VariantExhibitNode
}) => {
  const loadingState = useAppSelector(s => s.e2eTesting.loadingState)
  return (
    <div className="header">
      <div className="left">
        <RunButtonEl variantNode={props.variantNode} />
        {loadingState === LoadingState.FETCHING ? <LoadingEl /> : null}
      </div>
      <div className="right">
        <div className="tester-link">
          <span>Tester:</span>
          <ExternalLink text="Playwright" href="https://playwright.dev/" />
        </div>
      </div>
    </div>
  )
}

export const render = (props: {
  variantNode: VariantExhibitNode
}) => {
  const results = useAppSelector(s => s.e2eTesting.results)

  return (
    <div className="testing">
      <HeaderEl variantNode={props.variantNode} />
      {results != null ? <PlaywrightTestResults results={results as any} /> : null}
    </div>
  )
}

export default render
