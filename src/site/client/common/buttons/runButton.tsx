import { OmitTyped } from '@samhuk/type-helpers'
import React from 'react'

type Props = OmitTyped<React.DetailedHTMLProps<React.ButtonHTMLAttributes<HTMLButtonElement>, HTMLButtonElement>, 'type'>

export const render = (props: Props) => (
  // eslint-disable-next-line react/jsx-props-no-spreading
  <button {...props} type="button" className={`cl-run-button ${props.className}`}>
    <i className="fas fa-play" />
  </button>
)

export default render
