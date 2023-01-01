import { getTheme } from '../connectors/theme'
import { componentExhibitsReady } from './componentExhibits/actions'
import { fetchMetaDataThunk } from './metadata/reducer'
import { setTheme } from './theme/actions'
import { AppDispatch } from './types'

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
  if (areComponentExhibitsLoaded()) {
    res()
    return
  }

  let i = 0
  const interval = setInterval(() => {
    i += 1
    if (i > 100) {
      console.log('component exhibits didnt load :(')
      clearTimeout(interval)
    }
    console.log('trying to see if component exhibits are ready...')
    if (areComponentExhibitsLoaded()) {
      clearTimeout(interval)
      res()
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
  dispatch(fetchMetaDataThunk())
}
