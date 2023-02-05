import React, { useState } from 'react'
import { usePopper } from 'react-popper'
import { IntercomConnectionStatus } from '../../../../intercom/client'
import ErrorIcon from '../../common/testReporting/errorIcon'
import SuccessIcon from '../../common/testReporting/successIcon'
import { useAppSelector } from '../../store'

const statusToClassName: { [status in IntercomConnectionStatus]: string } = {
  [IntercomConnectionStatus.CONNECTED]: 'connected',
  [IntercomConnectionStatus.CONNECTING]: 'connecting',
  [IntercomConnectionStatus.NOT_CONNECTED]: 'not-connected',
}

export const render = () => {
  const connectionStatus = useAppSelector(s => s.intercom.connectionStatus)
  const intercomMetaData = useAppSelector(s => s.metaData.metaData?.intercom)
  const [referenceElement, setReferenceElement] = useState(null)
  const [popperElement, setPopperElement] = useState(null)
  const [arrowElement, setArrowElement] = useState(null)
  const { styles, attributes } = usePopper(referenceElement, popperElement, {
    modifiers: [
      { name: 'arrow', options: { element: arrowElement } },
      { name: 'offset', options: { offset: [0, 10] } },
      { name: 'preventOverflow', options: { altAxis: true, padding: 5 } },
    ],
  })
  const [show, setShow] = useState(false)

  return (
    <div className={`intercom ${statusToClassName[connectionStatus]}`} ref={setReferenceElement} onMouseEnter={() => setShow(true)} onMouseLeave={() => setShow(false)}>
      {connectionStatus === IntercomConnectionStatus.CONNECTED
        ? <i className="fas fa-plug" />
        : (
          <div className="not-connected-icon">
            <i className="fas fa-plug" />
            <i className="fas fa-xmark" />
            {connectionStatus === IntercomConnectionStatus.CONNECTING ? <i className="fas fa-spinner fa-spin" /> : null}
          </div>
        )}
      {show
        ? (
          // eslint-disable-next-line react/jsx-props-no-spreading
          <div className="cl-tooltip" ref={setPopperElement} style={styles.popper} {...attributes.popper}>
            <div className="arrow" ref={setArrowElement} style={styles.arrow} />
            {connectionStatus === IntercomConnectionStatus.CONNECTED
              ? (
                <div>
                  <SuccessIcon /> Connected to the live-reload server.
                </div>
              )
              : (
                <div>
                  <ErrorIcon /> Not connected to the live-reload server at&nbsp;
                  {intercomMetaData != null ? <b>{intercomMetaData.host}:{intercomMetaData.port}</b> : null}.
                  {connectionStatus === IntercomConnectionStatus.CONNECTING ? ' Connecting...' : ''}
                </div>
              )}
          </div>
        ) : null}
    </div>
  )
}

export default render