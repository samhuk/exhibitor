import { createBrowserStoreClient } from 'sock-state/lib/client/browser'
import { CONSOLE_LOG_CLIENT_REPORTER } from 'sock-state/lib/client/reporter'
import { MetaData } from '../../../common/metadata'
import { areAllBuildStatusesSuccessful, createBuildStatusesReducer, BUILD_STATUSES_TOPIC } from '../../../intercom/common'
import { BuildStatuses, BuildStatusesActions } from '../../../intercom/types'
import { setBuildStatuses, setConnectionStatus } from '../store/intercom/actions'
import { AppDispatch } from '../store/types'

export const createIntercomClient = async (metaData: MetaData, dispatch: AppDispatch) => {
  const intercomClient = createBrowserStoreClient({
    host: metaData.intercom.host,
    port: metaData.intercom.port,
    reporter: metaData.intercom.enableLogging ? CONSOLE_LOG_CLIENT_REPORTER : null,
  })

  intercomClient.on('connection-status-change', newStatus => {
    dispatch(setConnectionStatus(newStatus))
  })

  const buildStatusesTopic = intercomClient.topic<BuildStatuses, BuildStatusesActions>(BUILD_STATUSES_TOPIC)

  buildStatusesTopic.on('state-change', createBuildStatusesReducer(), (newBuildStatuses, isGetInitialState) => {
    // Ensure that we don't do a location.reload() on the initial state get, as this would cause an infinite loop
    if (isGetInitialState) {
      dispatch(setBuildStatuses(newBuildStatuses))
      return
    }

    if (areAllBuildStatusesSuccessful(newBuildStatuses)) {
      intercomClient.disconnect().then(() => {
        // eslint-disable-next-line no-restricted-globals
        location.reload()
      })
    }
    else {
      dispatch(setBuildStatuses(newBuildStatuses))
    }
  })

  await intercomClient.connect()
}
