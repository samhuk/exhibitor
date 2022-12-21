import React, { useEffect, useState } from 'react'
import { ExhibitNode, ExhibitNodeType } from '../../api/exhibit/types'

const areComponentExhibitsLoaded = () => {
  try {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const _test = exh
    return true
  }
  catch {
    return false
  }
}

const waitUntilComponentExhibitsAreLoaded = (): Promise<void> => new Promise((res, rej) => {
  let i = 0
  const interval = setInterval(() => {
    i += 1
    if (i > 100) {
      console.error('component exhibits didnt load :(')
      clearTimeout(interval)
    }
    if (areComponentExhibitsLoaded()) {
      clearTimeout(interval)
      res()
    }
  }, 50)
})

const getSelectedVariantNode = (): ExhibitNode<ExhibitNodeType.VARIANT> | null | undefined => {
  if (!areComponentExhibitsLoaded())
    return undefined

  const parentLocationPath = parent.location.pathname
  const _locationPath = parentLocationPath.startsWith('/') ? parentLocationPath.slice(1) : parentLocationPath
  const selectedNode = exh.nodes[_locationPath]
  return selectedNode != null && selectedNode.type === ExhibitNodeType.VARIANT
    ? selectedNode
    : null
}

const getSelectedVariantNodePath = (): string | null => {
  if (!areComponentExhibitsLoaded())
    return null

  const parentLocationPath = parent.location.pathname
  if (parentLocationPath.length < 2)
    return null

  const _locationPath = parentLocationPath.startsWith('/') ? parentLocationPath.slice(1) : parentLocationPath
  const selectedNode = exh.nodes[_locationPath]
  return selectedNode != null && selectedNode.type === ExhibitNodeType.VARIANT
    ? selectedNode.path
    : null
}

export const render = () => {
  const [ready, setReady] = useState(false)
  const [selectedVariantPath, setSelectedVariantPath] = useState(getSelectedVariantNodePath())

  useEffect(() => {
    const handler = (e: CustomEvent) => {
      setSelectedVariantPath(getSelectedVariantNodePath())
    }
    // @ts-ignore
    window.addEventListener('selected-variant-change', handler)
    return () => {
      // @ts-ignore
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

  return selectedVariantNode.exhibit.renderFn(selectedVariantNode.variant.props)
}

export default render
