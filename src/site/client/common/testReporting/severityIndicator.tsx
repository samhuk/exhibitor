import React from 'react'

export type Severity = 0 | 1 | 2 | 3

const createRange = (n: number): number[] => {
  const arr: number[] = []
  for (let i = 0; i < n; i += 1)
    arr.push(i)

  return arr
}

export const render = (props: {
  /**
   * Severity index from 0 to 3.
   *
   * 0: Minor
   * 1: Moderate
   * 2: Severe
   * 3: Critical
   */
  severity: 0 | 1 | 2 | 3
}) => (
  <div className={`cl-severity-indicator severity-${props.severity}`}>
    {createRange(props.severity + 1).map(i => (
      <div style={{ left: `${i * 20}px` }} />
    ))}
  </div>
)

export default render
