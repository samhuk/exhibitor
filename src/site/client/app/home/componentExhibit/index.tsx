import { BoolDependant, TypeDependantBaseIntersection } from '@samhuk/type-helpers/dist/type-helpers/types'
import cloneDeep from 'clone-deep'
import React, { useEffect, useMemo } from 'react'
import { useDispatch } from 'react-redux'
import { useLocation } from 'react-router-dom'

import { ComponentExhibit, Variant, VariantGroup } from '../../../../../api/exhibit/types'
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

const convertVariantPathToVariantPathComponents = (path: string): string[] => (
  path.split('/').filter(s => s.length > 0).map(decodeURIComponent)
)

export const getSelectedVariant = (
  variantPathString: string,
): GetSelectedVariantResult => {
  if (variantPathString == null) {
    return {
      success: false,
      failReason: GetSelectedVariantFailReason.NO_PATH,
    }
  }

  const variantPath = convertVariantPathToVariantPathComponents(variantPathString)
  const exhibitName = variantPath[0]

  const exhibit = Object.values(exh.default).find(e => e.name === exhibitName)
  if (exhibit == null) {
    return {
      success: false,
      attemptedExhibitName: exhibitName,
      failReason: GetSelectedVariantFailReason.EXHIBIT_NOT_FOUND,
      variantPath,
    }
  }

  let variant: Variant
  if (!exhibit.hasProps) {
    variant = { name: exhibit.name, props: undefined }
  }
  else {
    const variantName = variantPath[variantPath.length - 1]
    let currentVariantGroup: VariantGroup = exhibit
    let i = 1
    while (i < variantPath.length - 1) {
      currentVariantGroup = currentVariantGroup.variantGroups[variantPath[i]]
      i += 1
    }
    // TODO: Improve this logic
    variant = variantName === 'Default' ? { name: 'Default', props: exhibit.defaultProps } : currentVariantGroup.variants[variantName]
  }

  if (variant == null) {
    return {
      success: false,
      attemptedExhibitName: exhibitName,
      attemptedVariantName: variantPath[variantPath.length - 1],
      exhibit,
      failReason: GetSelectedVariantFailReason.VARIANT_NOT_FOUND,
      variantPath,
    }
  }

  return {
    success: true,
    exhibit,
    variant,
    variantPath,
  }
}

export const render = () => {
  const readyState = useAppSelector(s => s.componentExhibits.ready)
  /* Workaround because react-router-dom's useParams auto-decodes URI components,
   * which means the "/" character in variant or variant group names would conflict
   * URI syntax.
   */
  const dispatch = useDispatch()
  const locationPath = useLocation().pathname
  const resolvedInfo = useMemo(() => getSelectedVariant(locationPath), [locationPath])

  useEffect(() => {
    dispatch(selectVariant(locationPath, resolvedInfo.success))
  }, [locationPath])

  if (!readyState)
    return <div className="component-exhibit loading">Loading component exhibits...</div>

  if (resolvedInfo.success === false && resolvedInfo.failReason === GetSelectedVariantFailReason.NO_PATH)
    return <div className="component-exhibit no-selected">Select a component</div>

  if (resolvedInfo.success === false && resolvedInfo.failReason === GetSelectedVariantFailReason.EXHIBIT_NOT_FOUND)
    return <div className="component-exhibit not-found">Component exhibit for &quot;{resolvedInfo.attemptedExhibitName}&quot; does not exist.</div>

  if (resolvedInfo.success === false && resolvedInfo.failReason === GetSelectedVariantFailReason.VARIANT_NOT_FOUND) {
    return (
      <div className="component-exhibit not-found">
        Variant &quot;{resolvedInfo.attemptedVariantName}&quot; of Component exhibit &quot;{resolvedInfo.attemptedExhibitName}&quot; does not exist.
      </div>
    )
  }

  return (
    <div className="component-exhibit">
      <VariantEl
        exhibit={resolvedInfo.exhibit}
        variant={resolvedInfo.variant}
      />
    </div>
  )
}

export default render
