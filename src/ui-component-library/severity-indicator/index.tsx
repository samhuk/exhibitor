import React from 'react'
import { CLASS_NAME_PREFIX } from '../common'

/**
 * Severity index from 0 to 3.
 * * 0 - Minor
 * * 1 - Moderate
 * * 2 - Severe
 * * 3 - Critical
 */
export type Severity = 0 | 1 | 2 | 3

type Props = React.DetailedHTMLProps<React.HTMLAttributes<HTMLDivElement>, HTMLDivElement> & {
  severity: Severity
}

export const NAME = 'severity-indicator'
export const CLASS_NAME = `${CLASS_NAME_PREFIX}-${NAME}`
export const DEFAULT_PROPS: Props = {
  severity: 0,
}
const SEVERITY_TO_TITLE: { [k in Severity]: string } = {
  0: 'Minor',
  1: 'Moderate',
  2: 'Severe',
  3: 'Critical',
}

const createRange = (n: number): number[] => {
  const arr: number[] = []
  for (let i = 0; i < n; i += 1)
    arr.push(i)

  return arr
}

export const render = (props: Props) => (
  // eslint-disable-next-line react/jsx-props-no-spreading
  <div {...props} className={`${CLASS_NAME} severity-${props.severity} ${props.className ?? ''}`} title={props.title ?? SEVERITY_TO_TITLE[props.severity]}>
    {createRange(props.severity + 1).map(i => (
      <div style={{ left: `${i * 20}px` }} />
    ))}
  </div>
)

export default render
