import { areAllBuildStatusesSuccessful } from '../../../common/intercom/buildStatusService'
import { createIntercomClient as _createIntercomClient } from '../../../common/intercom/client'
import { IntercomIdentityType, IntercomMessageType } from '../../../common/intercom/types'
import { MetaData } from '../../../common/metadata'
import { setBuildStatuses, setConnectionStatus } from '../store/intercom/actions'
import { AppDispatch } from '../store/types'

export const createIntercomClient = async (metaData: MetaData, dispatch: AppDispatch) => {
  const intercomClient = _createIntercomClient({
    identityType: IntercomIdentityType.SITE_CLIENT,
    webSocketCreator: url => new WebSocket(url),
    // eslint-disable-next-line no-restricted-globals
    host: metaData.intercom.host,
    port: metaData.intercom.port,
    enableLogging: metaData.intercom.enableLogging,
    events: {
      onStatusChange: newStatus => {
        dispatch(setConnectionStatus(newStatus))
      },
      onMessage: msg => {
        if (msg.type === IntercomMessageType.BUILD_STATUSES_NOTICE) {
          dispatch(setBuildStatuses(msg.statuses))
        }
        else if (msg.type === IntercomMessageType.BUILD_STATUSES_CHANGE) {
          if (areAllBuildStatusesSuccessful(msg.statuses)) {
            intercomClient.disconnect()
            // eslint-disable-next-line no-restricted-globals
            location.reload()
          }
          else {
            dispatch(setBuildStatuses(msg.statuses))
          }
        }
      },
      onReconnect: () => {
        // eslint-disable-next-line no-restricted-globals
        location.reload()
        return { proceed: false }
      },
    },
  })

  await intercomClient.connect()
}
