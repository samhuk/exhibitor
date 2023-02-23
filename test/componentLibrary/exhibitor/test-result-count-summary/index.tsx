import React from 'react'
import { CLASS_NAME_PREFIX } from '../common'

type Props = React.DetailedHTMLProps<React.HTMLAttributes<HTMLDivElement>, HTMLDivElement> & {
  numPass?: number
  numFail?: number
  numSkip?: number
}

export const NAME = 'test-result-count-summary'
export const CLASS_NAME = `${CLASS_NAME_PREFIX}-${NAME}`
export const DEFAULT_PROPS: Props = {}

export const render = (props: Props) => (
  <div className={`${CLASS_NAME} ${props.className ?? ''}`}>
    {props.numPass != null && props.numPass > 0 ? <span className="pass">{props.numPass} PASS</span> : null}
    {props.numFail != null && props.numFail > 0 ? <span className="fail">{props.numFail} FAIL</span> : null}
    {props.numSkip != null && props.numSkip > 0 ? <span className="skip">{props.numSkip} SKIP</span> : null}
  </div>
)

export default render
