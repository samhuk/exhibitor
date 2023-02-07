import { MetaData } from '../../../common/metadata'
import { createBrowserIntercomClient } from '../../../intercom/client/browser'
import { IntercomMessageType } from '../../../intercom/message/types'
import { areAllBuildStatusesSuccessful } from '../../../intercom/server/buildStatusService'
import { IntercomIdentityType } from '../../../intercom/types'
import { setBuildStatuses, setConnectionStatus } from '../store/intercom/actions'
import { addProgressMessage } from '../store/testing/playwright/actions'
import { AppDispatch } from '../store/types'

export const createIntercomClient = async (metaData: MetaData, dispatch: AppDispatch) => {
  const intercomClient = createBrowserIntercomClient({
    identityType: IntercomIdentityType.SITE_CLIENT,
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
        else if (msg.type === IntercomMessageType.TEST_PROGRESS_UPDATE) {
          dispatch(addProgressMessage(msg.data))
        }
      },
      onReconnect: () => {
        intercomClient.disconnect()
        // eslint-disable-next-line no-restricted-globals
        location.reload()
        return { proceed: false }
      },
    },
  })

  await intercomClient.connect()
}
