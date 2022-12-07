import React from 'react'
import { ComponentExhibit, Variant } from '../../../../../api/exhibit/types'

export const render = (props: {
  exhibit: ComponentExhibit
  variant: Variant
}) => (
  <pre>{JSON.stringify(props.variant.props, null, 2)}</pre>
)

export default render
