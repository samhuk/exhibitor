import React from 'react'
import { useAppSelector } from '../../store'
import { BuildStatus } from '../../../../common/building'
import { ExhEnv } from '../../../../common/env'
import { IntercomConnectionStatus } from '../../../../common/intercom/client'

const BuildStatusIcon = (props: {
  connectionStatus: IntercomConnectionStatus
  status: BuildStatus
}) => (
  props.connectionStatus !== IntercomConnectionStatus.CONNECTED
    ? <i className="fas fa-question" />
    : props.status === BuildStatus.SUCCESS
      ? <i className="fas fa-check" />
      : props.status === BuildStatus.IN_PROGRESS
        ? <i className="fas fa-spinner fa-spin" />
        : <i className="fas fa-xmark" />
)

export const render = () => {
  const connectionStatus = useAppSelector(s => s.intercom.connectionStatus)
  const buildStatuses = useAppSelector(s => s.intercom.buildStatuses)
  const isDev = useAppSelector(s => s.metaData.metaData?.env) === ExhEnv.DEV

  return (
    <div className="build-statuses">
      <div className="status">
        <span className="name">CL</span>
        <BuildStatusIcon connectionStatus={connectionStatus} status={buildStatuses.COMP_LIB_WATCH} />
      </div>
      {isDev
        ? (
          <div className="status">
            <span className="name">SC</span>
            <BuildStatusIcon connectionStatus={connectionStatus} status={buildStatuses.CLIENT_WATCH} />
          </div>
        )
        : null}
    </div>
  )
}

export default render
