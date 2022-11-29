import React from 'react'
import { useParams } from 'react-router-dom'

import { useAppSelector } from '../../../store'

// TODO

const Variant = (props: { renderFn: (props: any) => JSX.Element, variant: { name: string, props: any }, key: string|number }) => (
  <div key={props.key} className="variant">
    <div className="name">{props.variant.name}</div>
    <div>{props.renderFn(props.variant.props)}</div>
  </div>
)

export const ComponentExhibit = () => {
  const componentExhibits = useAppSelector(s => s.componentExhibits)
  const name = useParams().name

  if (!componentExhibits.ready)
    return <div>Loading component exhibits...</div>

  const componentExhibit = exh.default.find(e => e.name === name)

  if (componentExhibit == null)
    return <div>Component exhibit does not exist.</div>

  return (
    <div className="component-exhibit">
      <Variant key="default" renderFn={componentExhibit.renderFn} variant={{ name: 'default', props: componentExhibit.defaultProps }} />
      {componentExhibit.variants.map((variant, i) => (
        <Variant key={i + 1} renderFn={componentExhibit.renderFn} variant={variant} />
      ))}
    </div>
  )
}
