import { HealthcheckStatus } from '../../common/responses'
import { fetchHealthCheckStatus } from '../connectors/healthcheck'
import { createBasicStoreSegmentArtifacts } from './basic'

export const healthcheckArtifacts = createBasicStoreSegmentArtifacts('HEALTHCHECK', fetchHealthCheckStatus, null as HealthcheckStatus)
