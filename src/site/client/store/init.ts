import { ExhibitNodes, PathTree } from '../../../api/exhibit/types'
import { getTheme } from '../connectors/theme'
import { createIntercomClient } from '../intercom'
import { componentExhibitsReady } from './componentExhibits/actions'
import { setEnabled } from './intercom/actions'
import { fetchMetaDataThunk } from './metadata/reducer'
import { setTheme } from './theme/actions'
import { AppDispatch } from './types'

const areComponentExhibitsLoaded = () => {
  try {
    return (window as any).exh != null
  }
  catch {
    return false
  }
}

const waitUntilComponentExhibitsAreLoaded = (): Promise<{ nodes: ExhibitNodes, pathTree: PathTree }> => new Promise((res, rej) => {
  if (areComponentExhibitsLoaded()) {
    res((window as any).exh)
    return
  }

  let i = 0
  const interval = setInterval(() => {
    i += 1
    if (i > 100) {
      console.log('component exhibits didnt load. Did index.exh.ts build correctly?')
      clearTimeout(interval)
    }
    console.log('Checking if component exhibits are ready...')
    if (areComponentExhibitsLoaded()) {
      clearTimeout(interval)
      res((window as any).exh)
    }
  }, 50)
})

export const init = async (dispatch: AppDispatch) => {
  // Restore saved theme
  const savedTheme = getTheme()
  if (savedTheme != null)
    dispatch(setTheme(savedTheme))

  await waitUntilComponentExhibitsAreLoaded()
  dispatch(componentExhibitsReady(null))
  dispatch(fetchMetaDataThunk(metaData => {
    if (metaData.intercom != null) {
      dispatch(setEnabled(true))
      createIntercomClient(metaData, dispatch)
    }
  }))
}
