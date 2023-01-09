import { AxeResults } from 'axe-core'
import { ExhibitNodeType } from '../api/exhibit/types'

export const areComponentExhibitsLoaded = () => {
  try {
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
      console.error('component exhibits didnt load :(')
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
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const _test = axe
    return true
  }
  catch {
    return false
  }
}

export const waitUntilAxeIsLoaded = (): Promise<void> => new Promise((res, rej) => {
  let i = 0
  const interval = setInterval(() => {
    i += 1
    if (i > 100) {
      console.error('component exhibits didnt load :(')
      clearTimeout(interval)
    }
    if (waitUntilAxeIsLoaded()) {
      clearTimeout(interval)
      res()
    }
  }, 50)
})

export const runAxe = (): Promise<AxeResults> => waitUntilAxeIsLoaded().then(() => axe.run(document.getElementById('exh-root'))
  .then((results: AxeResults) => {
    window.dispatchEvent(new CustomEvent('axe-test-completed', {
      detail: results,
    }))
  })
  .catch((error: any) => {
    console.error('axe failed:', error)
  }))

export const getSelectedVariantNodePath = (): string | null => {
  if (!areComponentExhibitsLoaded())
    return null

  // eslint-disable-next-line no-restricted-globals
  const parentLocationPath = parent.location.pathname
  if (parentLocationPath.length < 2)
    return null

  const _locationPath = parentLocationPath.startsWith('/') ? parentLocationPath.slice(1) : parentLocationPath
  const selectedNode = exh.nodes[_locationPath]
  return selectedNode != null && selectedNode.type === ExhibitNodeType.VARIANT
    ? selectedNode.path
    : null
}
