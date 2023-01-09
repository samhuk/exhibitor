import React, { useMemo, useRef, useState } from 'react'

import axe, { AxeResults, ImpactValue, Result } from 'axe-core'
import { ComponentExhibit, ExhibitNodeType, Variant, VariantExhibitNode } from '../../../../../../api/exhibit/types'
import { useAppSelector } from '../../../../store'

const doesCompSiteHaveAxeLoaded = (iframeEl: HTMLIFrameElement) => (iframeEl.contentWindow as any).axe == null

const ensureCompSiteHasAxeLoaded = (): HTMLIFrameElement => {
  const iframeEl = document.getElementsByTagName('iframe')[0]
  if (doesCompSiteHaveAxeLoaded(iframeEl)) {
    const scriptEl = document.createElement('script')
    scriptEl.async = true
    scriptEl.src = '/axe.js'
    iframeEl.contentDocument.head.appendChild(scriptEl)
  }
  return iframeEl
}

const runAxe = (): Promise<AxeResults> => new Promise((res, rej) => {
  const iframeEl = ensureCompSiteHasAxeLoaded()
  const axeTestCompletedHandler = (e: { detail: AxeResults}) => {
    res(e.detail)
    console.log(e.detail)
    iframeEl.contentWindow.removeEventListener('axe-test-completed', axeTestCompletedHandler)
  }
  iframeEl.contentWindow.addEventListener('axe-test-completed', axeTestCompletedHandler)
  iframeEl.contentWindow.dispatchEvent(new CustomEvent('axe-test'))
})

const LoadingEl = () => (
  <div className="loading">Running...</div>
)

const RunButtonEl = (props: {
  onClick: () => void
}) => (
  <button className="run-button" title="Rerun Accessibility Test" type="button" onClick={props.onClick}>
    <i className="fas fa-play" />
  </button>
)

const violationToIndex: { [impactValue in ImpactValue]: number } = {
  minor: 0,
  moderate: 1,
  serious: 2,
  critical: 3,
}

const ViolationSeverityIndicatorEl = (props: {
  severity: ImpactValue
}) => {
  const els: any[] = []
  for (let i = 0; i < violationToIndex[props.severity] + 1; i += 1)
    els.push(<div className="circle-icon" style={{ left: `${i * 20}px` }} />)

  return (
    <div className="severity-indicator">{els}</div>
  )
}

const ViolationItemDetailsEl = (props: {
  violation: Result
}) => (
  <div className="details">
    <div className="row rule">
      <div className="label">Rule:</div>
      <div className="value">{props.violation.id}</div>
    </div>
    <div className={`row impact ${props.violation.impact}`}>
      <div className="label">Impact:</div>
      <div className="value">{props.violation.impact}<ViolationSeverityIndicatorEl severity={props.violation.impact} /></div>
    </div>
    <div className="row description">
      <div className="label">Description:</div>
      <div className="value">{props.violation.description}</div>
    </div>
    <div className="row documentation-link">
      <a className="label" target="_blank" rel="noreferrer" href={props.violation.helpUrl}>
        Documentation
        <i className="fas fa-arrow-up-right-from-square" />
      </a>
    </div>
    <div className="nodes">
      <div className="label">Violating Nodes:</div>
      <ol className="value">
        {props.violation.nodes.map(node => (
          <li>
            <div><div className="label">Element:</div>{node.html}</div>
            <div><div className="label">Detail:</div>{node.failureSummary}</div>
          </li>
        ))}
      </ol>
    </div>
  </div>
)

const ViolationItemEl = (props: {
  violation: Result
}) => {
  const [showDetails, setShowDetails] = useState(false)

  return (
    <li className="item">
      <i className="error-icon far fa-circle-xmark" />
      <div className="text-and-details">
        <div className="text">
          {props.violation.help}
          <span className="node-count">{props.violation.nodes.length}</span>
          <button
            className={`toggle-show-details-button${showDetails ? ' active' : ''}`}
            title={showDetails ? 'Hide Details' : 'Show Details'}
            type="button"
            onClick={() => setShowDetails(!showDetails)}
          >
            <i className="fas fa-ellipsis" />
          </button>
        </div>
        {showDetails
          ? <ViolationItemDetailsEl violation={props.violation} />
          : null}
      </div>
    </li>
  )
}

const ViolationListEl = (props: {
  violationList: Result[]
}) => (
  <ol className="violation-list">
    {props.violationList.map(v => <ViolationItemEl violation={v} />)}
  </ol>
)

const NoViolationsEl = (props: {
  results: AxeResults
}) => (
  <div className="no-violations">
    <span>No accessibility violations</span>
    <i className="fas fa-check-circle" />
  </div>
)

const TotalNumTestsSummaryEl = (props: {
  results: AxeResults
}) => {
  const numPass = props.results.passes.length
  const numFail = props.results.violations.length

  return (
    <div className="total-num-tests-summary">
      {numPass > 0 ? <div className="passes">{numPass} PASS</div> : null}
      {numFail > 0 ? <div className="failures">{numFail} FAIL</div> : null}
    </div>
  )
}

export const render = (props: {
  exhibit: ComponentExhibit<true>
  variant: Variant
}) => {
  const variantPathLastRanFor = useRef(null)
  const [isLoading, setIsLoading] = useState(false)
  const [results, setResults] = useState<AxeResults>(null)

  const selectedVariantPath = useAppSelector(s => s.componentExhibits.selectedVariantPath)

  const run = () => {
    variantPathLastRanFor.current = selectedVariantPath
    setIsLoading(true)
    runAxe().then(_results => {
      setResults(_results)
      setIsLoading(false)
    })
  }

  /* If isn't loading, there is a selected variant path, and either the variant path last ran for is null
   * or the variant path last ran for isn't the currently selected one.
   */
  if (!isLoading && selectedVariantPath != null && (variantPathLastRanFor.current == null || variantPathLastRanFor.current !== selectedVariantPath))
    run()

  const hasResults = results != null
  const hasViolations = hasResults && results.violations.length > 0

  return (
    <div className="axe">
      <div className="header">
        <div className="left">
          <RunButtonEl onClick={run} />
          {isLoading ? <LoadingEl /> : null}
        </div>
        <div className="right">
          <div className="tester-link">
            <span>Tester:</span>
            <a className="label" target="_blank" rel="noreferrer" href="https://www.deque.com/axe/">
              axe <i className="fas fa-arrow-up-right-from-square" />
            </a>
          </div>
        </div>
      </div>
      {hasResults ? <TotalNumTestsSummaryEl results={results} /> : null}
      {hasResults
        ? hasViolations
          ? <ViolationListEl violationList={results.violations} />
          : <NoViolationsEl results={results} />
        : null}
    </div>
  )
}

export default render
