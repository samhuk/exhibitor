import React, { useEffect, useRef, useState } from 'react'
import { VariantExhibitNode } from '../../api/exhibit/types'
import {
  getSelectedVariantNodePath,
  runAxe,
  SELECT_VARIANT_CHANGE_EVENT_NAME,
  START_AXE_TEST_EVENT_NAME,
  waitUntilComponentExhibitsAreLoaded,
} from '../../common/exhibit'
import { attachEventLoggingToProps } from '../common'

export const useCompSiteEffect = (
  setSelectedVariantPathFn: (newPath: string) => any,
) => {
  // Add a listener for the custom event for when a selected variant changes.
  useEffect(() => {
    const onSelectedVariantChangeHandler = () => setSelectedVariantPathFn(getSelectedVariantNodePath())
    window.addEventListener(SELECT_VARIANT_CHANGE_EVENT_NAME, onSelectedVariantChangeHandler)
    const onStartAxeTestHandler = () => runAxe()
    window.addEventListener(START_AXE_TEST_EVENT_NAME, onStartAxeTestHandler)
    return () => {
      window.removeEventListener(SELECT_VARIANT_CHANGE_EVENT_NAME, onSelectedVariantChangeHandler)
      window.removeEventListener(START_AXE_TEST_EVENT_NAME, onStartAxeTestHandler)
    }
  }, [])
}

export const ReactCompSiteWithHooks = () => {
  const [ready, setReady] = useState(false)
  const isWaiting = useRef(false)
  const [selectedVariantPath, setSelectedVariantPath] = useState(getSelectedVariantNodePath())

  useCompSiteEffect(setSelectedVariantPath)

  if (!ready && !isWaiting) {
    isWaiting.current = true
    waitUntilComponentExhibitsAreLoaded().then(() => {
      isWaiting.current = false
      setSelectedVariantPath(getSelectedVariantNodePath())
      setReady(true)
    })
    return <div className="component-exhibit not-ready">Loading...</div>
  }

  if (selectedVariantPath == null)
    return <div className="component-exhibit not-found">No component variant selected.</div>

  // @ts-ignore
  const selectedVariantNode = exh.nodes[selectedVariantPath] as VariantExhibitNode
  const variantProps = attachEventLoggingToProps(selectedVariantNode)
  return selectedVariantNode.exhibit.renderFn(variantProps)
}
