import React from 'react'
import { useLocation } from 'react-router-dom'

import { ComponentExhibit, Variant, VariantGroup } from '../../../../../api/exhibit/types'
import Ternary from '../../../common/ternary'
import { useAppSelector } from '../../../store'

// TODO

const VariantEl = (props: { exhibit: ComponentExhibit, variant: Variant, id: string|number }) => (
  <div key={props.id} className="variant">
    <div className="name">{props.variant.name}</div>
    <div>{props.exhibit.renderFn(props.variant.props)}</div>
  </div>
)

const VariantGroupEl = (props: { exhibit: ComponentExhibit, variantGroup: VariantGroup, id: string|number }) => (
  <div key={props.id} className="variant-group">
    <div className="name">{props.variantGroup.name}</div>
    <div className="variants">
      {Object.values(props.variantGroup.variants).map((variant, i) => (
        <VariantEl id={i + 1} exhibit={props.exhibit} variant={variant} />
      ))}
    </div>
    <div className="variant-groups">
      {Object.values(props.variantGroup.variantGroups).map((variantGroup, i) => (
        <VariantGroupEl id={i + 1} exhibit={props.exhibit} variantGroup={variantGroup} />
      ))}
    </div>
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

  const componentExhibit = exh.default.find(e => e.name === exhibitName)

  if (componentExhibit == null)
    return <div className="component-exhibit not-found">Component exhibit for &quot;{exhibitName}&quot; does not exist.</div>

  return (
    <div className="component-exhibit">
      {componentExhibit.hasProps
        ? (
          <>
            <Ternary
              bool={componentExhibit.defaultProps != null}
              t={(
                <VariantEl
                  id="default"
                  exhibit={componentExhibit}
                  variant={{ name: 'default', props: componentExhibit.defaultProps }}
                />
              )}
            />
            <VariantGroupEl id="root" exhibit={componentExhibit} variantGroup={componentExhibit} />
          </>
        )
        : (
          <VariantEl id="default" exhibit={componentExhibit} variant={{ name: 'default', props: undefined }} />
        )}
    </div>
  )
}

export default render
