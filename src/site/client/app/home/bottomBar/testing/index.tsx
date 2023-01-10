import React from 'react'

import { VariantExhibitNode } from '../../../../../../api/exhibit/types'
import { RunE2eTestOptions } from '../../../../../common/e2eTesting'
import { useAppDispatch, useAppSelector } from '../../../../store'
import { runE2eTestThunk } from '../../../../store/componentExhibits/e2eTesting/reducer'
import { LoadingState } from '../../../../store/types'

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
  return (
    <button className="run-button" title="Run E2E Tests" type="button" onClick={onClick}>
      <i className="fas fa-play" />
    </button>
  )
}

const ResultsEl = (props: {
  results: any
}) => (
  <div className="results">
    <pre>{JSON.stringify(props.results, null, 2)}</pre>
  </div>
)

export const render = (props: {
  variantNode: VariantExhibitNode
}) => {
  const loadingState = useAppSelector(s => s.e2eTesting.loadingState)
  const results = useAppSelector(s => s.e2eTesting.results)

  return (
    <div className="testing">
      <RunButtonEl variantNode={props.variantNode} />
      {loadingState === LoadingState.FETCHING ? <div>Running Test...</div> : null}
      {results != null ? <ResultsEl results={results} /> : null}
    </div>
  )
}

export default render
