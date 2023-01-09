import React, { useRef, useState } from 'react'

import { AxeResults, ImpactValue, Result } from 'axe-core'
import { ComponentExhibit, Variant } from '../../../../../../api/exhibit/types'
import { useAppSelector } from '../../../../store'
import { AXE_TEST_COMPLETED_EVENT_NAME, START_AXE_TEST_EVENT_NAME } from '../../../../../../common/exhibit'

const addOneTimeCustomEventListener = <
  TEl extends EventTarget,
  TEvent extends CustomEvent,
>(el: TEl, eventName: string, handler: (e: TEvent) => void) => {
  const _handler = (e: TEvent) => {
    handler(e)
    el.removeEventListener(eventName, _handler as any)
  }
  el.addEventListener(eventName, _handler as any)
}

const dispatchCustomEvent = <
  TEl extends EventTarget,
>(el: TEl, eventName: string, data?: any) => {
  el.dispatchEvent(new CustomEvent(eventName, {
    detail: data,
  }))
}

const doesCompSiteHaveAxeLoaded = (iframeEl: HTMLIFrameElement) => (iframeEl.contentWindow as any).axe == null

const ensureCompSiteHasAxeLoaded = (): HTMLIFrameElement | null => {
  const iframeEl = document.getElementsByTagName('iframe')[0]
  if (iframeEl == null)
    return null

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
  if (iframeEl == null) {
    rej(new Error('comp-site iframe element does not exist.'))
    return
  }

  addOneTimeCustomEventListener(iframeEl.contentWindow, AXE_TEST_COMPLETED_EVENT_NAME, (e: { detail: AxeResults}) => {
    res(e.detail)
  })
  dispatchCustomEvent(iframeEl.contentWindow, START_AXE_TEST_EVENT_NAME)
})

const LoadingEl = () => (
  <div className="loading">Running...</div>
)

const WaitingForComponentRenderEl = () => (
  <div className="loading">Waiting for component to render...</div>
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

const NoViolationsEl = () => (
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
  const [isWaitingForComponentRender, setIsWaitingForComponentRender] = useState(false)
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

  /* If isn't loading, isn't waiting for component to render, there is a selected variant path, and either
   * there is no variant path last ran for or the variant path last ran for isn't the currently selected one.
   */
  const shouldDoRun = !isLoading
    && !isWaitingForComponentRender
    && selectedVariantPath != null
    && (variantPathLastRanFor.current == null || variantPathLastRanFor.current !== selectedVariantPath)

  if (shouldDoRun) {
    setIsWaitingForComponentRender(true)
    /* TODO: We need to find a way to listen for when the user's component inside the comp site
     * has finished rendering. Probably using useEffect, useRef, customEvent, etc.
     */
    setTimeout(() => {
      setIsWaitingForComponentRender(false)
      run()
    }, 500)
  }

  const hasResults = results != null
  const hasViolations = hasResults && results.violations.length > 0

  return (
    <div className="axe">
      <div className="header">
        <div className="left">
          <RunButtonEl onClick={run} />
          {isWaitingForComponentRender ? <WaitingForComponentRenderEl /> : null}
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
          : <NoViolationsEl />
        : null}
    </div>
  )
}

export default render
