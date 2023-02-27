import React, { useRef } from 'react'
import Button from '../../../../../../ui-component-library/button'
import { useAppDispatch, useAppSelector } from '../../../../store'
import { swapViewportDimensions } from '../../../../store/componentExhibits/actions'

export const render = (props: {
  onClick?: () => void
}) => {
  const size = useAppSelector(s => s.componentExhibits.viewportRectSizePx)
  const dispatch = useAppDispatch()
  const elRef = useRef<HTMLButtonElement>()

  const onClick = () => {
    elRef.current.classList.remove('clicked')
    elRef.current.classList.add('clicked')
    setTimeout(() => elRef.current.classList.remove('clicked'), 500)
    dispatch(swapViewportDimensions())
    props.onClick?.()
  }

  return (
    <Button
      ref={elRef}
      className="swap-button"
      disabled={size.height === size.width}
      onClick={onClick}
      title="Swap dimensions"
      icon={{ name: 'arrows-rotate' }}
    />
  )
}

export default render
