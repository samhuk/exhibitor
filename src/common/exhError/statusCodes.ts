import { ErrorType } from '../errorTypes'

export const STATUS_CODES: { [errorType in ErrorType]: number } = {
  INVALID_REQUEST: 400,
  UNAUTHORIZED: 401,
  NOT_FOUND: 404,
  SERVICE_TIMEOUT: 418,
  SERVER_ERROR: 500,
}
