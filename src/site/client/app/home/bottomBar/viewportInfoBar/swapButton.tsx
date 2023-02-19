import React, { useRef } from 'react'
import { useAppDispatch, useAppSelector } from '../../../../store'
import { updateViewportSize } from '../../../../store/componentExhibits/actions'

export const render = () => {
  const size = useAppSelector(s => s.componentExhibits.viewportRectSizePx)
  const dispatch = useAppDispatch()
  const elRef = useRef<HTMLButtonElement>()

  const onClick = () => {
    elRef.current.classList.remove('clicked')
    elRef.current.classList.add('clicked')
    setTimeout(() => elRef.current.classList.remove('clicked'), 500)
    dispatch(updateViewportSize({
      width: size.height,
      height: size.width,
    }))
  }

  return (
    <button
      ref={elRef}
      type="button"
      className="swap-button"
      disabled={size.height === size.width}
      onClick={onClick}
      aria-label="Swap dimensions"
      title="Swap dimensions"
    >
      <i className="fas fa-arrows-rotate" />
    </button>
  )
}

export default render
