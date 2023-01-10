import React from 'react'

type Props = React.DetailedHTMLProps<React.HTMLAttributes<HTMLDivElement>, HTMLDivElement>

export const render = (props: Props) => (
  // eslint-disable-next-line react/jsx-props-no-spreading
  <i {...props} className={`cl-success-icon fas fa-check-circle ${props.className}`} />
)

export default render
