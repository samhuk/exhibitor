import React from 'react'

export const render = (props: {
  numPass?: number
  numFail?: number
  numSkip?: number
}) => (
  <div className="cl-test-result-count-summary">
    {props.numPass != null && props.numPass > 0 ? <span className="pass">{props.numPass} PASS</span> : null}
    {props.numFail != null && props.numFail > 0 ? <span className="fail">{props.numFail} FAIL</span> : null}
    {props.numSkip != null && props.numSkip > 0 ? <span className="skip">{props.numSkip} SKIP</span> : null}
  </div>
)

export default render
