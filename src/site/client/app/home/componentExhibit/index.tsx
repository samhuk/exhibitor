import { BoolDependant, TypeDependantBaseIntersection } from '@samhuk/type-helpers/dist/type-helpers/types'
import React, { useEffect, useMemo, useState } from 'react'
import { useDispatch } from 'react-redux'
import { useLocation } from 'react-router-dom'

import { ComponentExhibit, ExhibitNodeType, Variant } from '../../../../../api/exhibit/types'
import { createResizer, ResizerLocation } from '../../../common/resizer'
import { useAppSelector } from '../../../store'
import { updateViewportSize, selectVariant } from '../../../store/componentExhibits/actions'
import Iframe from './iframe2'
import ResponsivenessInfo from './responsivenessInfo'

enum GetSelectedVariantFailReason {
  EXHIBIT_NOT_FOUND,
  VARIANT_NOT_FOUND,
  NO_PATH,
}

export type SuccessToFailReasonType<TSuccess extends boolean> = TSuccess extends false
  ? GetSelectedVariantFailReason
  : undefined

export type GetSelectedVariantResult<
  TSuccess extends boolean = boolean,
  TFailReason extends SuccessToFailReasonType<TSuccess> = SuccessToFailReasonType<TSuccess>,
> = BoolDependant<
  {
    true: {
      exhibit: ComponentExhibit
      variant: Variant
      variantPath: string[]
    }
    false: TypeDependantBaseIntersection<GetSelectedVariantFailReason, {
      [GetSelectedVariantFailReason.NO_PATH]: { }
      [GetSelectedVariantFailReason.EXHIBIT_NOT_FOUND]: {
        attemptedExhibitName: string
        variantPath: string[]
      }
      [GetSelectedVariantFailReason.VARIANT_NOT_FOUND]: {
        attemptedExhibitName: string
        variantPath: string[]
        exhibit: ComponentExhibit
        attemptedVariantName: string
      }
    }, TFailReason, 'failReason'>
  }, TSuccess, 'success'
>

export const render = () => {
  const dispatch = useDispatch()
  const readyState = useAppSelector(s => s.componentExhibits.ready)
  const viewportSizePx = useAppSelector(s => s.componentExhibits.viewportRectSizePx)
  /* Workaround because react-router-dom's useParams auto-decodes URI components,
   * which means the "/" character in variant or variant group names would conflict
   * URI syntax.
   */
  const locationPath = useLocation().pathname
  const _locationPath = locationPath.startsWith('/') ? locationPath.slice(1) : locationPath
  const selectedNode = readyState ? exh.nodes[_locationPath] : null
  const selectedVariantNode = selectedNode != null && selectedNode.type === ExhibitNodeType.VARIANT
    ? selectedNode
    : null
  const [iframeContainerEl, setIframeContainerEl] = useState<HTMLDivElement>(null)
  const [iframeEl, setIframeEl] = useState<HTMLIFrameElement>(null)
  const viewportSizeChangeEnabled = useAppSelector(s => s.componentExhibits.viewportSizeChangeEnabled)

  const onResizeStart = () => {
    (iframeContainerEl.firstElementChild as HTMLElement).style.pointerEvents = 'none'
  }

  const height = viewportSizePx?.height != null ? viewportSizePx.height : 300
  const width = viewportSizePx?.width != null ? viewportSizePx.width : 300

  const onXResizeFinish = (newWidthPx: number) => {
    (iframeContainerEl.firstElementChild as HTMLElement).style.pointerEvents = ''
    dispatch(updateViewportSize({
      height: parseInt(iframeContainerEl.style.height.replace('px', '')),
      width: newWidthPx,
    }))
  }
  const onYResizeFinish = (newHeightPx: number) => {
    (iframeContainerEl.firstElementChild as HTMLElement).style.pointerEvents = ''
    dispatch(updateViewportSize({
      height: newHeightPx,
      width: parseInt(iframeContainerEl.style.width.replace('px', '')),
    }))
  }

  if (iframeContainerEl != null) {
    if (viewportSizeChangeEnabled) {
      iframeContainerEl.style.height = `${height}px`
      iframeContainerEl.style.width = `${width}px`
      // You have to do a bit extra because the parent element is display: flex.
      iframeContainerEl.style.minWidth = `${width}px`
    }
    else {
      iframeContainerEl.style.height = '100%'
      iframeContainerEl.style.width = '100%'
    }
  }

  const leftResizer = useMemo(() => (viewportSizeChangeEnabled ? createResizer({
    el: iframeContainerEl,
    side: ResizerLocation.LEFT,
    initialSizePx: width,
    onResizeFinish: onXResizeFinish,
    onResizeStart,
    sizeChangeScale: 2,
    minSizePx: 50,
    includeMinSize: true,
  }) : (): any => undefined), [iframeContainerEl, viewportSizeChangeEnabled])
  const rightResizer = useMemo(() => (viewportSizeChangeEnabled ? createResizer({
    el: iframeContainerEl,
    side: ResizerLocation.RIGHT,
    initialSizePx: width,
    onResizeFinish: onXResizeFinish,
    onResizeStart,
    sizeChangeScale: 2,
    minSizePx: 50,
    includeMinSize: true,
  }) : (): any => undefined), [iframeContainerEl, viewportSizeChangeEnabled])
  const topResizer = useMemo(() => (viewportSizeChangeEnabled ? createResizer({
    el: iframeContainerEl,
    side: ResizerLocation.TOP,
    initialSizePx: height,
    onResizeFinish: onYResizeFinish,
    onResizeStart,
    sizeChangeScale: 2,
    minSizePx: 50,
  }) : (): any => undefined), [iframeContainerEl, viewportSizeChangeEnabled])
  const bottomResizer = useMemo(() => (viewportSizeChangeEnabled ? createResizer({
    el: iframeContainerEl,
    side: ResizerLocation.BOTTOM,
    initialSizePx: height,
    onResizeFinish: onYResizeFinish,
    onResizeStart,
    sizeChangeScale: 2,
    minSizePx: 50,
  }) : (): any => undefined), [iframeContainerEl, viewportSizeChangeEnabled])

  useEffect(leftResizer, [iframeContainerEl, viewportSizeChangeEnabled])
  useEffect(rightResizer, [iframeContainerEl, viewportSizeChangeEnabled])
  useEffect(topResizer, [iframeContainerEl, viewportSizeChangeEnabled])
  useEffect(bottomResizer, [iframeContainerEl, viewportSizeChangeEnabled])
  useEffect(() => {
    dispatch(selectVariant(selectedVariantNode?.path))
  }, [selectedVariantNode])

  if (!readyState)
    return <div className="component-exhibit loading">Loading component exhibits...</div>

  if (selectedVariantNode == null) {
    if (_locationPath.length > 0) {
      return (
        <div className="component-exhibit not-found">
          Component exhibit or variant thereof not found.
        </div>
      )
    }

    return (
      <div className="component-exhibit no-path">
        Select a variant from the navigator on the left
      </div>
    )
  }

  return (
    <div className={`component-exhibit found ${viewportSizeChangeEnabled ? 'viewport-size-change-enabled' : 'viewport-size-change-disabled'}`}>
      {viewportSizeChangeEnabled ? <ResponsivenessInfo iframeEl={iframeEl} /> : null}
      <div className="iframe-container" ref={el => setIframeContainerEl(el)}>
        <Iframe
          height="100%"
          width="100%"
          title="comp-site"
          src="/comp-site"
          ref={el => setIframeEl(el)}
        />
      </div>
    </div>
  )
}

export default render
