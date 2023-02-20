import React, { KeyboardEvent, useEffect, useRef, useState } from 'react'
import { waitForElement } from '../../../../common/util/element'
import { useAppDispatch, useAppSelector } from '../../../../store'
import { applyWorkingViewportSize, updateWorkingViewportSize } from '../../../../store/componentExhibits/actions'
import SwapButton from './swapButton'

const determineSizeRestrictions = (
  el: Element,
  desiredSize: { width: number, height: number },
): { width: boolean, height: boolean } | null => {
  if (el == null)
    return null

  const actualSize = el.getBoundingClientRect()
  const isWidthUnder = actualSize.width < desiredSize.width
  const isHeightUnder = actualSize.height < desiredSize.height

  return {
    width: isWidthUnder,
    height: isHeightUnder,
  }
}

const updateSizeRestrictions = (
  currentSizeRestrictions: { width: boolean, height: boolean },
  newSizeRestrictions: { width: boolean, height: boolean } | null,
  setIsWidthRestricted: (newValue: boolean) => any,
  setIsHeightRestricted: (newValue: boolean) => any,
) => {
  if (newSizeRestrictions == null)
    return

  if (newSizeRestrictions.width !== currentSizeRestrictions.width)
    setIsWidthRestricted(newSizeRestrictions.width)
  if (newSizeRestrictions.height !== currentSizeRestrictions.height)
    setIsHeightRestricted(newSizeRestrictions.height)
}

export const render = () => {
  const dispatch = useAppDispatch()
  const [isWidthRestricted, setIsWidthRestricted] = useState(false)
  const [isHeightRestricted, setIsHeightRestricted] = useState(false)
  const size = useAppSelector(s => s.componentExhibits.viewportRectSizePx)
  const workingSize = useAppSelector(s => s.componentExhibits.workingViewportRectSizePx)
  const [iframeContainerElRef, setIframeContainerElRef] = useState<Element>()

  const _updateSizeRestrictions = () => {
    updateSizeRestrictions(
      { width: isWidthRestricted, height: isHeightRestricted },
      determineSizeRestrictions(iframeContainerElRef, size),
      setIsWidthRestricted,
      setIsHeightRestricted,
    )
  }

  _updateSizeRestrictions()

  if (iframeContainerElRef == null) {
    waitForElement(() => document.getElementsByClassName('iframe-container')[0], { timeoutS: 2 }).then(el => {
      if (el !== iframeContainerElRef) {
        _updateSizeRestrictions()
        setIframeContainerElRef(el)
      }
    })
  }

  const _applyWorkingViewportSize = () => {
    dispatch(applyWorkingViewportSize())
  }

  const onKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key !== 'Enter')
      return

    _applyWorkingViewportSize()
  }

  const onBlur = () => _applyWorkingViewportSize()

  const onWidthChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    dispatch(updateWorkingViewportSize({
      height: workingSize.height,
      width: parseInt(e.target.value),
    }))
  }

  const onHeightChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    dispatch(updateWorkingViewportSize({
      height: parseInt(e.target.value),
      width: workingSize.width,
    }))
  }

  useEffect(() => {
    const timeoutId = setInterval(() => _updateSizeRestrictions(), 1000)
    return () => clearTimeout(timeoutId)
  }, [iframeContainerElRef, size, isWidthRestricted, isHeightRestricted])

  return (
    <div className="viewport-info-bar">
      <input
        className={isWidthRestricted ? 'invalid' : ''}
        type="number"
        onChange={onWidthChange}
        onBlur={onBlur}
        onKeyDown={onKeyDown}
        value={workingSize.width}
      />
      <div className="dimensions-seperator"><i className="fas fa-xmark" /></div>
      <input
        className={isHeightRestricted ? 'invalid' : ''}
        type="number"
        onChange={onHeightChange}
        onBlur={onBlur}
        onKeyDown={onKeyDown}
        value={workingSize.height}
      />
      <SwapButton />
    </div>
  )
}

export default render
