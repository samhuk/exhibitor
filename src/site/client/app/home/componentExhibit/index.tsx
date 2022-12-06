import React from 'react'
import { useLocation } from 'react-router-dom'

import { ComponentExhibit, Variant, VariantGroup } from '../../../../../api/exhibit/types'
import { useAppSelector } from '../../../store'

const VariantEl = (props: { exhibit: ComponentExhibit, variant: Variant }) => (
  <div className="variant">
    <div>{props.exhibit.renderFn(props.variant.props)}</div>
  </div>
)

export const render = () => {
  const componentExhibits = useAppSelector(s => s.componentExhibits)
  /* Workaround because react-router-dom's useParams auto-decodes URI components,
   * which means the "/" character in variant or variant group names would conflict
   * URI syntax.
   */
  const variantPathUriPath = useLocation().pathname

  if (!componentExhibits.ready)
    return <div className="component-exhibit loading">Loading component exhibits...</div>

  const variantPathComponents = variantPathUriPath.split('/').filter(s => s.length > 0).map(decodeURIComponent)
  const exhibitName = variantPathComponents[0]

  const exhibit = exh.default.find(e => e.name === exhibitName)
  if (exhibit == null)
    return <div className="component-exhibit not-found">Component exhibit for &quot;{exhibitName}&quot; does not exist.</div>

  let variant: Variant
  if (!exhibit.hasProps) {
    variant = { name: exhibit.name, props: undefined }
  }
  else {
    const variantName = variantPathComponents[variantPathComponents.length - 1]
    let currentVariantGroup: VariantGroup = exhibit
    let i = 1
    while (i < variantPathComponents.length - 1) {
      currentVariantGroup = currentVariantGroup.variantGroups[variantPathComponents[i]]
      i += 1
    }
    // TODO: Improve this logic
    variant = variantName === 'Default' ? { name: 'Default', props: exhibit.defaultProps } : currentVariantGroup.variants[variantName]
  }

  if (variant == null) {
    return (
      <div className="component-exhibit not-found">
        Variant &quot;{variantPathComponents[variantPathComponents.length - 1]}&quot; of Component exhibit &quot;{exhibitName}&quot; does not exist.
      </div>
    )
  }

  return (
    <div className="component-exhibit">
      <VariantEl
        exhibit={exhibit}
        variant={variant}
      />
    </div>
  )
}

export default render
