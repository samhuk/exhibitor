import { HealthcheckStatus } from '../../common/responses'
import { get } from './core'

export const fetchHealthCheckStatus = () => get<HealthcheckStatus>(
  'healthcheck',
)
