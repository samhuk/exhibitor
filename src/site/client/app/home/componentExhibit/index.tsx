import { BoolDependant, TypeDependantBaseIntersection } from '@samhuk/type-helpers/dist/type-helpers/types'
import React, { useEffect, useMemo } from 'react'
import { useDispatch } from 'react-redux'
import { useLocation } from 'react-router-dom'

import { ComponentExhibit, Variant, VariantGroup } from '../../../../../api/exhibit/types'
import { useAppSelector } from '../../../store'
import { selectVariant } from '../../../store/componentExhibits/actions'

const VariantEl = (props: { exhibit: ComponentExhibit, variant: Variant }) => (
  <div className="variant">
    <div>{props.exhibit.renderFn(props.variant.props)}</div>
  </div>
)

enum GetSelectedVariantFailReason {
  EXHIBIT_NOT_FOUND,
  VARIANT_NOT_FOUND
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
    }
    false: TypeDependantBaseIntersection<GetSelectedVariantFailReason, {
      [GetSelectedVariantFailReason.EXHIBIT_NOT_FOUND]: { }
      [GetSelectedVariantFailReason.VARIANT_NOT_FOUND]: {
        exhibit: ComponentExhibit
        attemptedVariantName: string
      }
    }, TFailReason, 'failReason'> & { attemptedExhibitName: string }
  }, TSuccess, 'success'
> & { variantPath: string[] }

export type GetSelectedVariantResultState<
  TSuccess extends boolean = boolean,
  TFailReason extends SuccessToFailReasonType<TSuccess> = SuccessToFailReasonType<TSuccess>,
> = BoolDependant<
{
  true: {
    exhibitName: string
    variantName: string
  }
  false: TypeDependantBaseIntersection<GetSelectedVariantFailReason, {
    [GetSelectedVariantFailReason.EXHIBIT_NOT_FOUND]: { }
    [GetSelectedVariantFailReason.VARIANT_NOT_FOUND]: {
      attemptedVariantName: string
    }
  }, TFailReason, 'failReason'> & { attemptedExhibitName: string }
}, TSuccess, 'success'
> & { variantPath: string[] }

const convertLocationPathToVariantPath = (locationPath: string): string[] => (
  locationPath.split('/').filter(s => s.length > 0).map(decodeURIComponent)
)

export const getSelectedVariant = (
  variantPath: string[],
): GetSelectedVariantResult => {
  const exhibitName = variantPath[0]

  const exhibit = exh.default.find(e => e.name === exhibitName)
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
  const componentExhibits = useAppSelector(s => s.componentExhibits)
  /* Workaround because react-router-dom's useParams auto-decodes URI components,
   * which means the "/" character in variant or variant group names would conflict
   * URI syntax.
   */
  const locationPath = useLocation().pathname
  const dispatch = useDispatch()
  const resolvedInfo = useMemo(() => getSelectedVariant(convertLocationPathToVariantPath(locationPath)), [locationPath])

  useEffect(() => {
    dispatch(selectVariant(resolvedInfo.variantPath, resolvedInfo.success))
  }, [locationPath])

  if (!componentExhibits.ready)
    return <div className="component-exhibit loading">Loading component exhibits...</div>

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
