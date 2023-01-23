import { HealthcheckStatus } from '../../common/healthcheck'
import { get } from './core'

export const fetchHealthCheckStatus = () => get<HealthcheckStatus>(
  'healthcheck',
)
