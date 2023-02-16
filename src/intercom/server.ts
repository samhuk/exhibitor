import { CONSOLE_LOG_SERVER_REPORTER, createStoreServer, Reducer, StoreServerReporter } from 'sock-state'
import { BuildStatus } from '../common/building'
import { getIntercomNetworkLocationFromProcessEnvs } from './client'
import { createBuildStatusesReducer, INITIAL_STATE } from './common'

export const startIntercomServer = (options?: {
  networkLocation?: {
    host: string
    port: number
  }
  reporter?: StoreServerReporter
  isSiteAlreadyBuilt?: boolean
}) => {
  const reporter = options?.reporter ?? (process.env.EXH_SHOW_INTERCOM_LOG ? CONSOLE_LOG_SERVER_REPORTER : null)
  const networkLocation = options?.networkLocation ?? getIntercomNetworkLocationFromProcessEnvs(process)

  /* In some environments, the Site (client and server) is already built, such as when it's
   * ran as an NPM package.
   */
  const initialBuildStatusesState = (options?.isSiteAlreadyBuilt ?? false)
    ? { COMP_LIB: BuildStatus.NONE, SITE_CLIENT: BuildStatus.SUCCESS, SITE_SERVER: BuildStatus.SUCCESS }
    : INITIAL_STATE

  return createStoreServer({
    host: networkLocation.host,
    port: networkLocation.port,
    topics: {
      buildStatuses: {
        reducer: createBuildStatusesReducer(initialBuildStatusesState) as Reducer,
      },
    },
    reporter,
  })
}
