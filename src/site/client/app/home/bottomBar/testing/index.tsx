import React from 'react'

import { VariantExhibitNode } from '../../../../../../api/exhibit/types'
import { RunE2eTestOptions } from '../../../../../common/e2eTesting'
import RunButton from '../../../../common/buttons/runButton'
import ExternalLink from '../../../../common/text/externalLink'
import { useAppDispatch, useAppSelector } from '../../../../store'
import { toggleHeadless } from '../../../../store/testing/playwright/actions'
import { runPlaywrightTestsThunk } from '../../../../store/testing/playwright/reducer'
import { LoadingState } from '../../../../store/types'
import PlaywrightTestResults from './playwright/results'

const RunButtonEl = (props: {
  variantNode: VariantExhibitNode
}) => {
  const dispatch = useAppDispatch()
  const variantPath = useAppSelector(s => s.componentExhibits.selectedVariantPath)
  const options = useAppSelector(s => s.testing.playwright.options)
  const onClick = () => {
    const _options: RunE2eTestOptions = {
      exhibitSrcFilePath: props.variantNode.exhibit.srcPath,
      headless: options.headless,
      testFilePath: props.variantNode.exhibit.testSrcPath,
      variantPath,
    }
    dispatch(runPlaywrightTestsThunk(_options))
  }
  return <RunButton onClick={onClick} title="Run Tests" />
}

const LoadingEl = () => {
  const loadingState = useAppSelector(s => s.testing.playwright.loadingState)
  return loadingState === LoadingState.FETCHING
    ? <div className="loading">Running...</div>
    : null
}

const ToggleHeadlessEl = () => {
  const dispatch = useAppDispatch()
  const headless = useAppSelector(s => s.testing.playwright.options.headless)

  return (
    <div>
      <span>Headless:</span>
      <input onChange={() => dispatch(toggleHeadless())} type="checkbox" checked={headless} />
    </div>
  )
}

const HeaderEl = (props: {
  variantNode: VariantExhibitNode
}) => (
  <div className="header">
    <div className="left">
      <RunButtonEl variantNode={props.variantNode} />
      <LoadingEl />
      <ToggleHeadlessEl />
    </div>
    <div className="right">
      <div className="tester-link">
        <span>Tester:</span>
        <ExternalLink text="Playwright" href="https://playwright.dev/" />
      </div>
    </div>
  </div>
)

export const render = (props: {
  variantNode: VariantExhibitNode
}) => (
  <div className="testing">
    <HeaderEl variantNode={props.variantNode} />
    <PlaywrightTestResults />
  </div>
)

export default render
