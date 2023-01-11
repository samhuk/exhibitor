import { OmitTyped } from '@samhuk/type-helpers'
import React from 'react'

type Props = OmitTyped<React.DetailedHTMLProps<React.AnchorHTMLAttributes<HTMLAnchorElement>, HTMLAnchorElement>, 'target' | 'rel'> & {
  text: string
}

export const render = (props: Props) => (
  // eslint-disable-next-line react/jsx-props-no-spreading
  <a {...props} target="_blank" rel="noreferrer" className={`cl-external-link ${props.className}`}>
    {props.text}<i className="fas fa-arrow-up-right-from-square" />
  </a>
)

export default render
