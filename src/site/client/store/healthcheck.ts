import { HealthcheckStatus } from '../../common/healthcheck'
import { fetchHealthCheckStatus } from '../connectors/healthcheck'
import { createBasicStoreSegmentArtifacts } from './basic'

export const healthcheckArtifacts = createBasicStoreSegmentArtifacts('HEALTHCHECK', fetchHealthCheckStatus, null as HealthcheckStatus)
