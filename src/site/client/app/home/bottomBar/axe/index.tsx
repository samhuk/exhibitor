import React, { useRef, useState } from 'react'

import { AxeResults, ImpactValue, Result } from 'axe-core'
import { ComponentExhibit, Variant } from '../../../../../../api/exhibit/types'
import { useAppSelector } from '../../../../store'
import { AXE_TEST_COMPLETED_EVENT_NAME, START_AXE_TEST_EVENT_NAME } from '../../../../../../common/exhibit'
import Counter from '../../../../../../ui-component-library/counter'
import RunButton from '../../../../../../ui-component-library/run-button'
import SeverityIndicator, { Severity } from '../../../../../../ui-component-library/severity-indicator'
import ExternalLink from '../../../../../../ui-component-library/external-link'
import TestResultCountSummary from '../../../../../../ui-component-library/test-result-count-summary'
import ErrorIcon from '../../../../../../ui-component-library/error-icon'
import SuccessIcon from '../../../../../../ui-component-library/success-icon'
import Button from '../../../../../../ui-component-library/button'

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

const violationImpactToSeverity: { [impactValue in ImpactValue]: Severity } = {
  minor: 0,
  moderate: 1,
  serious: 2,
  critical: 3,
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
      <div className="value">{props.violation.impact}<SeverityIndicator severity={violationImpactToSeverity[props.violation.impact]} /></div>
    </div>
    <div className="row description">
      <div className="label">Description:</div>
      <div className="value">{props.violation.description}</div>
    </div>
    <div className="row documentation-link">
      <ExternalLink className="label" text="Documentation" href={props.violation.helpUrl} />
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
      <ErrorIcon />
      <div className="text-and-details">
        <div className="text">
          {props.violation.help}
          <Counter count={props.violation.nodes.length} />
          <Button
            className={`toggle-show-details-button${showDetails ? ' active' : ''}`}
            title={showDetails ? 'Hide Details' : 'Show Details'}
            onClick={() => setShowDetails(!showDetails)}
            icon={{ name: 'ellipsis' }}
          />
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
    No accessibility violations
    <SuccessIcon />
  </div>
)

export const render = (props: {
  exhibit: ComponentExhibit
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
          <RunButton onClick={run} />
          {isWaitingForComponentRender ? <WaitingForComponentRenderEl /> : null}
          {isLoading ? <LoadingEl /> : null}
        </div>
        <div className="right">
          <div className="tester-link">
            <span>Tester:</span>
            <ExternalLink text="axe" href="https://www.deque.com/axe/" />
          </div>
        </div>
      </div>
      {hasResults ? <TestResultCountSummary numPass={results.passes.length} numFail={results.violations.length} /> : null}
      {hasResults
        ? hasViolations
          ? <ViolationListEl violationList={results.violations} />
          : <NoViolationsEl />
        : null}
    </div>
  )
}

export default render
