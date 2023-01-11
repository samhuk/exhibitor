import React from 'react'

type Props = React.DetailedHTMLProps<React.HTMLAttributes<HTMLDivElement>, HTMLDivElement> & {
  count: number
}

export const render = (props: Props) => (
  // eslint-disable-next-line react/jsx-props-no-spreading
  <span {...props} className={`cl-counter ${props.className}`}>
    {props.count}
  </span>
)

export default render
