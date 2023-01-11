import React from 'react'

import { VariantExhibitNode } from '../../../../../../api/exhibit/types'
import { PlaywrightTestResults, RunE2eTestOptions } from '../../../../../common/e2eTesting'
import RunButton from '../../../../common/buttons/runButton'
import ExternalLink from '../../../../common/text/externalLink'
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
  return <RunButton onClick={onClick} title="Run Tests" />
}

const SpecEl = (props: {
  spec: PlaywrightTestResults['suites'][number]['specs'][number]
}) => (
  <div className="item">
    Spec: {props.spec.title}
    Pass?: {props.spec.ok ? 'YES' : 'NO'}
  </div>
)

const SpecsEl = (props: {
  specs: PlaywrightTestResults['suites'][number]['specs']
}) => (
  <div className="spec-list">
    <b>Specs:</b>
    {props.specs.map(spec => <SpecEl spec={spec} />)}
  </div>
)

const SuiteEl = (props: {
  suite: PlaywrightTestResults['suites'][number]
}) => (
  <div className="item">
    Suite: {props.suite.title}
    <SpecsEl specs={props.suite.specs} />
  </div>
)

const SuitesEl = (props: {
  suites: PlaywrightTestResults['suites']
}) => (
  <div className="suite-list">
    <b>Suites:</b>
    {props.suites.map(suite => <SuiteEl suite={suite} />)}
  </div>
)

const ResultsEl = (props: {
  results: PlaywrightTestResults
}) => (
  <div className="results">
    <SuitesEl suites={props.results.suites} />
  </div>
)

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
      {results != null ? <ResultsEl results={results} /> : null}
    </div>
  )
}

export default render
