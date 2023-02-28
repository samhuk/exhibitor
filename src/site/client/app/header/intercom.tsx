import React, { useState } from 'react'
import { usePopper } from 'react-popper'
import { ConnectionStatus } from 'sock-state/lib/common/connectionStatus'
import ErrorIcon from '../../../../ui-component-library/error-icon'
import SuccessIcon from '../../../../ui-component-library/success-icon'
import Tooltip from '../../../../ui-component-library/tooltip'
import { useAppSelector } from '../../store'

const statusToClassName: { [status in ConnectionStatus]: string } = {
  [ConnectionStatus.CONNECTED]: 'connected',
  [ConnectionStatus.CONNECTING]: 'connecting',
  [ConnectionStatus.DISCONNECTED]: 'not-connected',
}

export const render = () => {
  const connectionStatus = useAppSelector(s => s.intercom.connectionStatus)
  const intercomMetaData = useAppSelector(s => s.metaData.metaData?.intercom)

  const referenceEl = connectionStatus === ConnectionStatus.CONNECTED
    ? <i className="fas fa-plug" />
    : (
      <div className="not-connected-icon">
        <i className="fas fa-plug" />
        <i className="fas fa-xmark" />
        {connectionStatus === ConnectionStatus.CONNECTING ? <i className="fas fa-spinner fa-spin" /> : null}
      </div>
    )

  const tooltipComponent = () => (connectionStatus === ConnectionStatus.CONNECTED
    ? (
      <div>
        <SuccessIcon /> Connected to the live-reload server.
      </div>
    )
    : (
      <div>
        <ErrorIcon /> Not connected to the live-reload server at&nbsp;
        {intercomMetaData != null ? <b>{intercomMetaData.host}:{intercomMetaData.port}</b> : null}.
        {connectionStatus === ConnectionStatus.CONNECTING ? ' Connecting...' : ''}
      </div>
    ))

  return (
    <Tooltip
      referenceEl={referenceEl}
      tooltipEl={tooltipComponent}
      className={`intercom ${statusToClassName[connectionStatus]}`}
      offset={{ y: 10 }}
      appearMode="hover"
    />
  )
}

export default render
