import { componentExhibitsReady } from './componentExhibits/actions'
import { AppDispatch } from './types'

const areComponentExhibitsLoaded = () => {
  try {
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
  await waitUntilComponentExhibitsAreLoaded()
  dispatch(componentExhibitsReady(exh.default, null))
}
