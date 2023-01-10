import { AxeResults } from 'axe-core'
import { ExhibitNodeType } from '../api/exhibit/types'

export const SELECT_VARIANT_CHANGE_EVENT_NAME = 'selected-variant-change'

export const START_AXE_TEST_EVENT_NAME = 'axe-test'
export const AXE_TEST_COMPLETED_EVENT_NAME = 'axe-test-completed'

export const areComponentExhibitsLoaded = () => {
  try {
    // @ts-ignore
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const _test = exh
    return true
  }
  catch {
    return false
  }
}

export const waitUntilComponentExhibitsAreLoaded = (): Promise<void> => new Promise(res => {
  let i = 0
  const interval = setInterval(() => {
    i += 1
    if (i > 100) {
      console.error('component exhibits didnt load.')
      clearTimeout(interval)
    }
    if (areComponentExhibitsLoaded()) {
      clearTimeout(interval)
      res()
    }
  }, 50)
})

export const isAxeLoaded = () => {
  try {
    // @ts-ignore
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const _test = axe
    return true
  }
  catch {
    return false
  }
}

export const waitUntilAxeIsLoaded = (): Promise<any> => new Promise((res, rej) => {
  if (isAxeLoaded()) {
    // @ts-ignore
    res(axe)
    return
  }

  let i = 0
  const interval = setInterval(() => {
    i += 1
    if (i > 100) {
      console.error('component exhibits didnt load :(')
      clearTimeout(interval)
    }
    if (isAxeLoaded()) {
      clearTimeout(interval)
      // @ts-ignore
      res(axe)
    }
  }, 50)
})

export const runAxe = (): Promise<AxeResults> => waitUntilAxeIsLoaded().then(axe => axe.run(document.getElementById('exh-root'))
  .then((results: AxeResults) => {
    window.dispatchEvent(new CustomEvent(AXE_TEST_COMPLETED_EVENT_NAME, {
      detail: results,
    }))
  })
  .catch((error: any) => {
    console.error('axe failed:', error)
  }))

const getVariantPathFromLocation = () => {
  // eslint-disable-next-line no-restricted-globals
  if (parent !== window) {
    // eslint-disable-next-line no-restricted-globals
    const locationPath = parent.location.pathname
    if (locationPath == null || locationPath.length < 2)
      return null

    return locationPath.startsWith('/') ? locationPath.slice(1) : locationPath
  }

  // eslint-disable-next-line no-restricted-globals
  const pathFromSearch = new URLSearchParams(location.search).get('path')
  if (pathFromSearch == null || pathFromSearch.length < 2)
    return null

  return pathFromSearch
}

export const getSelectedVariantNodePath = (): string | null => {
  if (!areComponentExhibitsLoaded())
    return null

  const variantPath = getVariantPathFromLocation()

  // @ts-ignore
  const selectedNode = exh.nodes[variantPath]
  return selectedNode != null && selectedNode.type === ExhibitNodeType.VARIANT
    ? selectedNode.path
    : null
}
