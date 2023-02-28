import React, { useEffect, useState } from 'react'
import { usePopper } from 'react-popper'
import Button from '../button'
import { CLASS_NAME_PREFIX } from '../common'
import ExternalLink from '../external-link'
import Tooltip from '../tooltip'

export enum FeatureStatus {
  ALPHA = 'Alpha',
  BETA = 'Beta',
}

export type Props = React.DetailedHTMLProps<React.HTMLAttributes<HTMLDivElement>, HTMLDivElement> & {
  status: FeatureStatus
  featureName: string
}

export const NAME = 'feature-status'
export const CLASS_NAME = `${CLASS_NAME_PREFIX}-${NAME}`
export const DEFAULT_PROPS: Props = {
  featureName: '',
  status: FeatureStatus.BETA,
}

export const render = (props: Props) => {
  const referenceEl = (
    <Button>
      {props.status} feature
      <i className="fas fa-circle-info" />
    </Button>
  )

  const tooltipComponent = () => (
    <>
      <p>
        {props.featureName ?? DEFAULT_PROPS.featureName} is in <b>{props.status ?? DEFAULT_PROPS.status} status</b>,
        meaning that it is under active developmentand may have minor issues and missing functionality.
      </p>
      <p>
        If you would like something added or changed, head over to the&nbsp;
        <ExternalLink text="Exhibitor Discussion 💬" href="https://github.com/samhuk/exhibitor/discussions/categories/ideas" />.
      </p>
    </>
  )

  return (
    <Tooltip
      referenceEl={referenceEl}
      tooltipEl={tooltipComponent}
      className={`${CLASS_NAME} ${props.className ?? ''}`}
    />
  )
}

export default render
