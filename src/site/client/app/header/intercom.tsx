import React from 'react'
import { IntercomStatus } from '../../../../common/intercom/client'
import { useAppSelector } from '../../store'

const statusToClassName: { [status in IntercomStatus]: string } = {
  [IntercomStatus.CONNECTED]: 'connected',
  [IntercomStatus.CONNECTING]: 'connecting',
  [IntercomStatus.NOT_CONNECTED]: 'not-connected',
}

export const NotConnectedIconEl = () => (
  <div className="not-connected-icon">
    <i className="fas fa-plug" />
    <i className="fas fa-xmark" />
  </div>
)

export const render = () => {
  const status = useAppSelector(s => s.intercom.status)

  return (
    <div className={`intercom ${statusToClassName[status]}`}>
      {status === IntercomStatus.CONNECTED
        ? <i className="fas fa-plug" />
        : (
          <NotConnectedIconEl />
        )}
    </div>
  )
}

export default render
