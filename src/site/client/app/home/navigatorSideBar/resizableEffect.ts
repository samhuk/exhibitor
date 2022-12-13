import { EffectCallback, MutableRefObject } from 'react'

export const DEFAULT_WIDTH_PX = 300

/**
 * This React effect adds an element on the RHS of the given `elRef`
 * that that when dragged horizontally will resize `elRef`. When the
 * dragging finishes, `onResizeFinish` is called with the final width
 * of `elRef` in px units.
 */
export const createTopLevelElResizableEffect = (
  elRef: MutableRefObject<HTMLDivElement>,
  initialWidthPx: number,
  onResizeFinish: (newWidthPx: number) => void,
): EffectCallback => () => {
  const resizerEl = document.createElement('div')
  resizerEl.classList.add('exh-resizer')
  elRef.current.appendChild(resizerEl)
  elRef.current.style.width = `${initialWidthPx}px`

  const state: any = {
    initialUserSelectStyleValue: null,
    initialWidth: 0,
    x0: 0,
    x1: 0,
    mouseDownHandler: null,
    mouseMoveHandler: null,
    mouseUpHandler: null,
  }

  state.mouseDownHandler = (e: MouseEvent) => {
    state.initialWidth = elRef.current.getBoundingClientRect().width
    state.x0 = e.screenX
    state.x1 = e.screenX
    // Ensure that it's impossible to end up with dupe listeners
    document.removeEventListener('mouseup', state.mouseUpHandler)
    document.addEventListener('mouseup', state.mouseUpHandler)
    document.removeEventListener('mousemove', state.mouseMoveHandler)
    document.addEventListener('mousemove', state.mouseMoveHandler)
    state.initialUserSelectStyleValue = elRef.current.style.userSelect
    elRef.current.style.userSelect = 'none'
  }

  state.mouseMoveHandler = (e: MouseEvent) => {
    state.x1 = e.screenX
    const dx = state.x1 - state.x0
    elRef.current.style.width = `${state.initialWidth + dx}px`
  }

  state.mouseUpHandler = (e: MouseEvent) => {
    state.x1 = e.screenX
    const dx = state.x1 - state.x0
    const newWidthPx = state.initialWidth + dx
    elRef.current.style.width = `${newWidthPx}px`

    elRef.current.style.userSelect = state.initialUserSelectStyleValue
    document.removeEventListener('mouseup', state.mouseUpHandler)
    document.removeEventListener('mousemove', state.mouseMoveHandler)
    onResizeFinish(newWidthPx)
  }

  resizerEl.addEventListener('mousedown', state.mouseDownHandler)
  return () => {
    resizerEl.removeEventListener('mousedown', state.mouseDownHandler)
    document.removeEventListener('mouseup', state.mouseUpHandler)
    document.removeEventListener('mousemove', state.mouseMoveHandler)
    elRef.current.removeChild(resizerEl)
  }
}
