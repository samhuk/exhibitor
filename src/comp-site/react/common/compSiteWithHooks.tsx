import React, { useEffect, useRef, useState } from 'react'
import { ComponentExhibit, VariantExhibitNode } from '../../../api/exhibit/types'
import {
  getSelectedVariantNodePath,
  runAxe,
  SELECT_VARIANT_CHANGE_EVENT_NAME,
  START_AXE_TEST_EVENT_NAME,
  waitUntilComponentExhibitsAreLoaded,
} from '../../../common/exhibit'
import { attachEventLoggingToProps } from '../../common'

const addCustomEventListener = <TEvent extends CustomEvent>(el: EventTarget, eventName: string, handler: (e: TEvent) => void) => {
  el.addEventListener(eventName, handler as any)
  return () => el.removeEventListener(eventName, handler as any)
}

export const useCompSiteEffect = (
  setSelectedVariantPathFn: (newPath: string) => any,
) => useEffect(() => {
  // Listen for the call to tell us that the selected variant changed
  const remove1 = addCustomEventListener(window, SELECT_VARIANT_CHANGE_EVENT_NAME, () => setSelectedVariantPathFn(getSelectedVariantNodePath()))
  // Listen for the call to run an accessibility test on the currently selected variant
  const remove2 = addCustomEventListener(window, START_AXE_TEST_EVENT_NAME, () => runAxe())

  return () => {
    remove1()
    remove2()
  }
}, [])

// const VariantEl = (props: { variantExhibitNode: VariantExhibitNode }) => {
//   const variantProps = attachEventLoggingToProps(props.variantExhibitNode)
//   return props.variantExhibitNode.exhibit.renderFn(variantProps)
// }

export const ReactCompSiteWithHooks = () => {
  const doInitialLoad = useRef(true)
  const [selectedVariantPath, setSelectedVariantPath] = useState(null)

  useCompSiteEffect(setSelectedVariantPath)

  if (doInitialLoad.current) {
    doInitialLoad.current = false
    waitUntilComponentExhibitsAreLoaded().then(() => {
      setSelectedVariantPath(getSelectedVariantNodePath())
    })
    return <div className="component-exhibit not-ready">Loading...</div>
  }

  if (selectedVariantPath === null)
    return <div className="component-exhibit not-found">No component variant selected.</div>

  if (selectedVariantPath === undefined)
    return <div className="component-exhibit not-found">Component variant not found.</div>

  /* The below method of rendering the variant is *deliberate*. If done any other way, it
   * causes the "used different hooks between renders" error. Using the JSX <... /> syntax
   * seems to make it all okay.
   */
  // @ts-ignore
  const variantNode = exh.nodes[selectedVariantPath] as VariantExhibitNode
  const variantProps = attachEventLoggingToProps(variantNode)

  const VariantEl = variantNode.exhibit.renderFn

  // eslint-disable-next-line react/jsx-props-no-spreading
  return <VariantEl {...variantProps} />
}
