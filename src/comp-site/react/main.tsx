/* eslint react/jsx-filename-extension: 0 */
import cloneDeep from 'clone-deep'
import React, { useEffect, useState } from 'react'
import { createRoot } from 'react-dom/client'
import { ExhibitNode, ExhibitNodeType } from '../../api/exhibit/types'
import { getSelectedVariantNodePath, waitUntilComponentExhibitsAreLoaded } from '../../common/exhibit'
import { deepSetAllPropsOnMatch } from '../../common/obj'

const container = document.getElementById('exh-root')

const root = createRoot(container)

const App = () => {
  const [ready, setReady] = useState(false)
  const [selectedVariantPath, setSelectedVariantPath] = useState(getSelectedVariantNodePath())

  // Add a listener for the custom event for when a selected variant changes.
  useEffect(() => {
    const handler = () => setSelectedVariantPath(getSelectedVariantNodePath())
    window.addEventListener('selected-variant-change', handler)
    return () => {
      window.removeEventListener('selected-variant-change', handler)
    }
  }, [])

  if (!ready) {
    waitUntilComponentExhibitsAreLoaded().then(() => {
      setSelectedVariantPath(getSelectedVariantNodePath())
      setReady(true)
    })
    return <div className="component-exhibit not-ready">LOADING</div>
  }

  if (selectedVariantPath == null)
    return <div className="component-exhibit not-found">NOT SELECTED</div>

  const selectedVariantNode = exh.nodes[selectedVariantPath] as ExhibitNode<ExhibitNodeType.VARIANT>

  const variantProps = selectedVariantNode.exhibit.hasProps && selectedVariantNode.exhibit.eventProps != null
    ? deepSetAllPropsOnMatch(selectedVariantNode.exhibit.eventProps, cloneDeep(selectedVariantNode.variant.props), (args, path) => {
      (parent as any).eventLogService.add({ args, path })
    })
    : selectedVariantNode.variant.props

  return selectedVariantNode.exhibit.renderFn(variantProps)
}

root.render(<App />)
