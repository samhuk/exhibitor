import React from 'react'
import { useParams } from 'react-router-dom'
import { useAppSelector } from "../../../store"

// TODO
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
      {componentExhibit.variants.map((variant, i) => (
        <div key={i + 1}>
          <div>{variant.name}</div>
          <div>{componentExhibit.renderFn(variant.props)}</div>
        </div>
      ))}
    </div>
  )
}
