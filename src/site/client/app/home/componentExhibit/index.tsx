import { BoolDependant, TypeDependantBaseIntersection } from '@samhuk/type-helpers/dist/type-helpers/types'
import cloneDeep from 'clone-deep'
import React, { useEffect, useMemo } from 'react'
import { useDispatch } from 'react-redux'
import { useLocation } from 'react-router-dom'

import { ComponentExhibit, ExhibitNode, ExhibitNodeType, Variant } from '../../../../../api/exhibit/types'
import { eventLogService } from '../../../services/eventLogService'
import { useAppSelector } from '../../../store'
import { addEvent, selectVariant } from '../../../store/componentExhibits/actions'
import { deepSetAllPropsOnMatch } from '../bottomBar/eventLog'

const VariantEl = (props: { exhibit: ComponentExhibit, variant: Variant }) => {
  const dispatch = useDispatch()
  const variantProps = props.exhibit.hasProps && props.exhibit.eventProps != null
    ? deepSetAllPropsOnMatch(props.exhibit.eventProps, cloneDeep(props.variant.props), (args, path) => {
      const item = eventLogService.add({ args, path })
      dispatch(addEvent(item.id))
    })
    : props.variant.props

  return (
    <div className="variant">
      <div>{props.exhibit.renderFn(variantProps)}</div>
    </div>
  )
}

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
  const readyState = useAppSelector(s => s.componentExhibits.ready)
  /* Workaround because react-router-dom's useParams auto-decodes URI components,
   * which means the "/" character in variant or variant group names would conflict
   * URI syntax.
   */
  const dispatch = useDispatch()
  const locationPath = useLocation().pathname
  const _locationPath = locationPath.startsWith('/') ? locationPath.slice(1) : locationPath
  const selectedNode = readyState ? exh.nodes[_locationPath] : null
  const selectedVariantNode = selectedNode != null && selectedNode.type === ExhibitNodeType.VARIANT
    ? selectedNode
    : null

  useEffect(() => {
    dispatch(selectVariant(selectedVariantNode?.path))
  }, [selectedVariantNode])

  if (!readyState)
    return <div className="component-exhibit loading">Loading component exhibits...</div>

  if (selectedVariantNode == null) {
    return (
      <div className="component-exhibit not-found">
        Component exhibit or variant thereof not found.
      </div>
    )
  }

  return (
    <div className="component-exhibit">
      <VariantEl
        exhibit={selectedVariantNode.exhibit}
        variant={selectedVariantNode.variant}
      />
    </div>
  )
}

export default render
