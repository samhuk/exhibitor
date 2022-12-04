import React from 'react'
import { useParams } from 'react-router-dom'

import { ComponentExhibit } from '../../../../../api/exhibit/types'
import Ternary from '../../../common/ternary'
import { useAppSelector } from '../../../store'

// TODO

const Variant = (props: { exhibit: ComponentExhibit, variant: { name: string, props?: any }, id: string|number }) => (
  <div key={props.id} className="variant">
    <div className="name">{props.variant.name}</div>
    <div>{props.exhibit.renderFn(props.variant.props)}</div>
  </div>
)

export const render = () => {
  const componentExhibits = useAppSelector(s => s.componentExhibits)
  const name = useParams().name

  if (!componentExhibits.ready)
    return <div className="component-exhibit loading">Loading component exhibits...</div>

  const componentExhibit = exh.default.find(e => e.name === name)

  if (componentExhibit == null)
    return <div className="component-exhibit not-found">Component exhibit for &quot;{name}&quot; does not exist.</div>

  return (
    <div className="component-exhibit">
      {componentExhibit.hasProps
        ? (
          <>
            <Ternary
              bool={componentExhibit.defaultProps != null}
              t={(
                <Variant
                  id="default"
                  exhibit={componentExhibit}
                  variant={{ name: 'default', props: componentExhibit.defaultProps }}
                />
              )}
            />
            {Object.values(componentExhibit.variants).map((variant, i) => (
              <Variant id={i + 1} exhibit={componentExhibit} variant={variant} />
            ))}
          </>
        )
        : (
          <Variant id="default" exhibit={componentExhibit} variant={{ name: 'default' }} />
        )}
    </div>
  )
}

export default render
