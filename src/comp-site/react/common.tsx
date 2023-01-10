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

const addCustomEventListener = <TEvent extends CustomEvent>(el: EventTarget, eventName: string, handler: (e: TEvent) => void) => {
  el.addEventListener(eventName, handler as any)
  return () => el.removeEventListener(eventName, handler as any)
}

export const useCompSiteEffect = (
  setSelectedVariantPathFn: (newPath: string) => any,
) => {
  useEffect(() => {
    // Listen for the call to tell us that the selected variant changed
    const remove1 = addCustomEventListener(window, SELECT_VARIANT_CHANGE_EVENT_NAME, () => setSelectedVariantPathFn(getSelectedVariantNodePath()))
    // Listen for the call to run an accessibility test on the currently selected variant
    const remove2 = addCustomEventListener(window, START_AXE_TEST_EVENT_NAME, () => runAxe())

    return () => {
      remove1()
      remove2()
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
