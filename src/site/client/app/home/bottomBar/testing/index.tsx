import React from 'react'

import { VariantExhibitNode } from '../../../../../../api/exhibit/types'
import ExternalLink from '../../../../../../ui-component-library/external-link'
import FeatureStatusEl, { FeatureStatus } from '../../../../../../ui-component-library/feature-status'
import RunButton from '../../../../../../ui-component-library/run-button'
import { RunPlaywrightTestsOptions } from '../../../../../common/testing/playwright'
import { useAppDispatch, useAppSelector } from '../../../../store'
import { toggleHeadless } from '../../../../store/testing/playwright/actions'
import { runPlaywrightTestsThunk } from '../../../../store/testing/playwright/reducer'
import PlaywrightTestResults from './playwright'

const RunButtonEl = (props: {
  variantNode: VariantExhibitNode
}) => {
  const dispatch = useAppDispatch()
  const variantPath = useAppSelector(s => s.componentExhibits.selectedVariantPath)
  const options = useAppSelector(s => s.testing.playwright.options)
  const onClick = () => {
    const _options: RunPlaywrightTestsOptions = {
      exhibitSrcFilePath: props.variantNode.exhibit.srcPath,
      headless: options.headless,
      testFilePath: props.variantNode.exhibit.testSrcPath,
      variantPath,
    }
    dispatch(runPlaywrightTestsThunk(_options))
  }
  return <RunButton onClick={onClick} title="Run Tests" />
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
    <FeatureStatusEl featureName="Playwright testing" status={FeatureStatus.BETA} />
    <HeaderEl variantNode={props.variantNode} />
    <PlaywrightTestResults />
  </div>
)

export default render
