import createNodeStoreClient from 'sock-state/lib/client/node'
import { BuildStatus, BuildStatusReporter, createBuildStatusReporter } from '../common/building'
import { NetworkLocation } from '../common/network'
import { BUILD_STATUSES_TOPIC, DEFAULT_INTERCOM_PORT, INTERCOM_PORT_ENV_VAR_NAME } from './common'
import { BuiltExhIdentity } from './types'

const getIntercomHostFromProcessEnvs = (_process: NodeJS.Process) => _process.env.EXH_SITE_SERVER_HOST

const getIntercomPortFromProcessEnvs = (_process: NodeJS.Process) => (process.env[INTERCOM_PORT_ENV_VAR_NAME] != null
  ? parseInt(process.env[INTERCOM_PORT_ENV_VAR_NAME])
  : DEFAULT_INTERCOM_PORT)

export const getIntercomNetworkLocationFromProcessEnvs = (_process: NodeJS.Process) => ({
  host: getIntercomHostFromProcessEnvs(_process),
  port: getIntercomPortFromProcessEnvs(_process),
})

export const createBuiltExhIdentityClient = (identity: BuiltExhIdentity, options?: {
  networkLocation?: NetworkLocation,
}) => {
  const networkLocation = options?.networkLocation ?? getIntercomNetworkLocationFromProcessEnvs(process)
  const client = createNodeStoreClient({ host: networkLocation.host, port: networkLocation.port })
  let buildStatusReporter: BuildStatusReporter = null

  const dispatchBuildStatusUpdateToIntercom = (status: BuildStatus) => {
    client.dispatch({
      topic: BUILD_STATUSES_TOPIC,
      type: 'updateStatus',
      payload: { identity, status },
    })
  }

  buildStatusReporter = createBuildStatusReporter({
    onChange: dispatchBuildStatusUpdateToIntercom,
  })

  client.connect()

  dispatchBuildStatusUpdateToIntercom(buildStatusReporter.status)

  return {
    host: networkLocation.host,
    port: networkLocation.port,
    client,
    buildStatusReporter,
  }
}
