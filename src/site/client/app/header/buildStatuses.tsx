import React from 'react'
import { useAppSelector } from '../../store'
import { BuildStatus } from '../../../../common/building'

const BuildStatusIcon = (props: {
  status: BuildStatus
}) => (
  props.status === BuildStatus.SUCCESS
    ? <i className="fas fa-check" />
    : props.status === BuildStatus.IN_PROGRESS
      ? <i className="fas fa-spinner fa-spin" />
      : <i className="fas fa-xmark" />
)

export const render = () => {
  const buildStatuses = useAppSelector(s => s.intercom.buildStatuses)

  return (
    <div className="build-statuses">
      <div>
        <span>Component Library:</span>
        <BuildStatusIcon status={buildStatuses.COMP_LIB_WATCH} />
        <span>Site Client:</span>
        <BuildStatusIcon status={buildStatuses.CLIENT_WATCH} />
      </div>
    </div>
  )
}

export default render
