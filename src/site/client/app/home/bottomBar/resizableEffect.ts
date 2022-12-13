import { EffectCallback, MutableRefObject } from 'react'

export const DEFAULT_HEIGHT_PX = 400

/**
 * This React effect adds an element on the top of the given `elRef`
 * that that when dragged vertically will resize `elRef`. When the
 * dragging finishes, `onResizeFinish` is called with the final height
 * of `elRef` in px units.
 */
export const createTopLevelElResizableEffect = (
  elRef: MutableRefObject<HTMLDivElement>,
  onResizeFinish: (newHeightPx: number) => void,
): EffectCallback => () => {
  if (elRef.current == null)
    return () => {}

  const resizerEl = document.createElement('div')
  resizerEl.classList.add('exh-resizer', 'horizontal')
  elRef.current.appendChild(resizerEl)

  const state: any = {
    initialUserSelectStyleValue: null,
    initialHeight: 0,
    y0: 0,
    y1: 0,
    mouseDownHandler: null,
    mouseMoveHandler: null,
    mouseUpHandler: null,
  }

  state.mouseDownHandler = (e: MouseEvent) => {
    state.initialHeight = elRef.current.getBoundingClientRect().height
    state.y0 = e.screenY
    state.y1 = e.screenY
    // Ensure that it's impossible to end up with dupe listeners
    document.removeEventListener('mouseup', state.mouseUpHandler)
    document.addEventListener('mouseup', state.mouseUpHandler)
    document.removeEventListener('mousemove', state.mouseMoveHandler)
    document.addEventListener('mousemove', state.mouseMoveHandler)
    state.initialUserSelectStyleValue = elRef.current.style.userSelect
    elRef.current.style.userSelect = 'none'
  }

  state.mouseMoveHandler = (e: MouseEvent) => {
    state.y1 = e.screenY
    const dy = state.y0 - state.y1 // Flipped from expected because of how browser screen co-ords work
    elRef.current.style.height = `${state.initialHeight + dy}px`
  }

  state.mouseUpHandler = (e: MouseEvent) => {
    state.y1 = e.screenY
    const dy = state.y0 - state.y1
    const newHeightPx = state.initialHeight + dy
    elRef.current.style.height = `${newHeightPx}px`

    elRef.current.style.userSelect = state.initialUserSelectStyleValue
    document.removeEventListener('mouseup', state.mouseUpHandler)
    document.removeEventListener('mousemove', state.mouseMoveHandler)
    onResizeFinish(newHeightPx)
  }

  resizerEl.addEventListener('mousedown', state.mouseDownHandler)

  return () => {
    resizerEl.removeEventListener('mousedown', state.mouseDownHandler)
    document.removeEventListener('mouseup', state.mouseUpHandler)
    document.removeEventListener('mousemove', state.mouseMoveHandler)
    elRef.current?.removeChild(resizerEl)
  }
}
