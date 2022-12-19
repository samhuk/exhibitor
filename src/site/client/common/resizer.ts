import { EffectCallback } from 'react'

export const DEFAULT_WIDTH_PX = 300

enum Dimension2D {
  X,
  Y
}

export enum ResizerLocation {
  TOP,
  BOTTOM,
  LEFT,
  RIGHT
}

const resizerLocationToCssClass = {
  [ResizerLocation.TOP]: 'top',
  [ResizerLocation.BOTTOM]: 'bottom',
  [ResizerLocation.LEFT]: 'left',
  [ResizerLocation.RIGHT]: 'right',
}

type Options = {
  side: ResizerLocation
  el: HTMLElement
  onResizeStart?: () => void
  onResizeFinish: (newSizePx: number) => void
  initialSizePx: number
  /**
   * @default 1
   */
  sizeChangeScale?: number
  minSizePx?: number
}

type State = {
  mouseDownHandler: (e: MouseEvent) => void
  mouseMoveHandler: (e: MouseEvent) => void
  mouseUpHandler: (e: MouseEvent) => void
  startSize: number
  startPos: number
  initialUserSelectStyleValue: string
}

const INITIAL_STATE: State = {
  mouseDownHandler: null,
  mouseMoveHandler: null,
  mouseUpHandler: null,
  startPos: null,
  startSize: null,
  initialUserSelectStyleValue: null,
}

const createSizeSetter = (el: HTMLElement, dimension: Dimension2D) => (
  dimension === Dimension2D.X
    ? (newSizePx: number) => el.style.width = `${newSizePx}px`
    : (newSizePx: number) => el.style.height = `${newSizePx}px`
)

const createSizeGetter = (el: HTMLElement, dimension: Dimension2D) => (
  dimension === Dimension2D.X
    ? () => el.getBoundingClientRect().width
    : () => el.getBoundingClientRect().height
)

const createClickEventPosGetter = (dimension: Dimension2D) => (
  dimension === Dimension2D.X
    ? (e: MouseEvent) => e.screenX
    : (e: MouseEvent) => e.screenY
)

/**
 * This React effect adds an element on the RHS of the given `elRef`
 * that that when dragged horizontally will resize `elRef`. When the
 * dragging finishes, `onResizeFinish` is called with the final width
 * of `elRef` in px units.
 */
export const createResizer = (options: Options): EffectCallback => () => {
  if (options.el == null)
    return () => undefined

  const dimension = options.side === ResizerLocation.LEFT || options.side === ResizerLocation.RIGHT
    ? Dimension2D.X
    : Dimension2D.Y

  const minSizePx = options.minSizePx ?? 0

  const setSize = createSizeSetter(options.el, dimension)
  const getSize = createSizeGetter(options.el, dimension)
  const getClickEventPos = createClickEventPosGetter(dimension)
  const sizeChangeScale = options.sizeChangeScale ?? 1

  const resizerEl = document.createElement('div')
  resizerEl.classList.add(
    'exh-resizer',
    resizerLocationToCssClass[options.side],
  )
  options.el.appendChild(resizerEl)

  setSize(options.initialSizePx)

  const state = {
    ...INITIAL_STATE,
  }

  const getDPos = options.side === ResizerLocation.LEFT || options.side === ResizerLocation.TOP
    ? (e: MouseEvent): number => state.startPos - getClickEventPos(e)
    : (e: MouseEvent): number => getClickEventPos(e) - state.startPos

  const updateSizeFromClickEvent = (e: MouseEvent): number => {
    const newSizePx = state.startSize + (getDPos(e) * sizeChangeScale)
    if (newSizePx < minSizePx) {
      setSize(minSizePx)
      return minSizePx
    }

    setSize(newSizePx)
    return newSizePx
  }

  state.mouseDownHandler = (e: MouseEvent) => {
    state.startSize = getSize()
    const clickEventPos = getClickEventPos(e)
    state.startPos = clickEventPos
    // Ensure that it's impossible to end up with dupe listeners
    document.removeEventListener('mouseup', state.mouseUpHandler)
    document.addEventListener('mouseup', state.mouseUpHandler)
    document.removeEventListener('mousemove', state.mouseMoveHandler)
    document.addEventListener('mousemove', state.mouseMoveHandler)
    state.initialUserSelectStyleValue = options.el.style.userSelect
    options.el.style.userSelect = 'none'
    options.onResizeStart?.()
    resizerEl.classList.add('resizing')
    const iframeEls = document.getElementsByTagName('iframe')
    for (let i = 0; i < iframeEls.length; i += 1)
      iframeEls[i].style.pointerEvents = 'none'
  }

  state.mouseMoveHandler = (e: MouseEvent) => {
    updateSizeFromClickEvent(e)
  }

  state.mouseUpHandler = (e: MouseEvent) => {
    const newSizePx = updateSizeFromClickEvent(e)

    options.el.style.userSelect = state.initialUserSelectStyleValue
    document.removeEventListener('mouseup', state.mouseUpHandler)
    document.removeEventListener('mousemove', state.mouseMoveHandler)
    options.onResizeFinish(newSizePx)
    resizerEl.classList.remove('resizing')

    const iframeEls = document.getElementsByTagName('iframe')
    for (let i = 0; i < iframeEls.length; i += 1)
      iframeEls[i].style.pointerEvents = ''
  }

  resizerEl.addEventListener('mousedown', state.mouseDownHandler)
  return () => {
    resizerEl.removeEventListener('mousedown', state.mouseDownHandler)
    document.removeEventListener('mouseup', state.mouseUpHandler)
    document.removeEventListener('mousemove', state.mouseMoveHandler)
    options.el.removeChild(resizerEl)
  }
}
