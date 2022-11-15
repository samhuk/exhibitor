export type Env = {
  isProd: boolean
  /**
   * The port the server is hosted on. Default: `8080`
   */
  port: number
}

const isProd = process.env.NODE_ENV === 'production'
const SECRET_KEYWORD = '{DEFINE}'

const getEnvironmentVariableNumber = (
  envVarName: string,
  defaultValue?: number,
  notProvidedMessage?: string,
  invalidMessage?: string,
): number => {
  const _notProvidedMessage = notProvidedMessage != null ? ` ${notProvidedMessage}` : ''
  const _invalidMessage = invalidMessage != null ? ` ${invalidMessage}` : ''

  const envVar = process.env[envVarName]

  if (isProd && envVar === SECRET_KEYWORD)
    throw new Error(`Encountered fatal error while getting environment variable "${envVarName}": Has been left as "${SECRET_KEYWORD}", which indicates that it's likely a production secret.`)

  if (envVar == null && defaultValue == null) {
    console.warn(`Environment variable ${envVarName} is not defined.${_notProvidedMessage}.`)
    return null
  }
  if (envVar == null) {
    console.warn(`Environment variable ${envVarName} is not defined. Using default ${defaultValue}.${_notProvidedMessage}.`)
    return defaultValue
  }
  const parsedEnvVar = parseInt(envVar)
  if (Number.isNaN(parsedEnvVar) && defaultValue == null) {
    console.warn(`Environment variable ${envVarName} is not valid (${envVar}).${_invalidMessage}.`)
    return null
  }
  if (Number.isNaN(parsedEnvVar)) {
    console.warn(`Environment variable ${envVarName} is not valid (${envVar}). Using default ${defaultValue}.${_invalidMessage}.`)
    return defaultValue
  }
  return parsedEnvVar
}

const getEnvironmentVariableBoolean = (
  envVarName: string,
  defaultValue?: boolean,
  notProvidedMessage?: string,
  invalidMessage?: string,
): boolean => {
  const _notProvidedMessage = notProvidedMessage != null ? ` ${notProvidedMessage}` : ''
  const _invalidMessage = invalidMessage != null ? ` ${invalidMessage}` : ''

  const envVar = process.env[envVarName]

  if (isProd && envVar === SECRET_KEYWORD)
    throw new Error(`Encountered fatal error while getting environment variable "${envVarName}": Has been left as "${SECRET_KEYWORD}", which indicates that it's likely a production secret.`)

  if (envVar == null && defaultValue == null) {
    console.warn(`Environment variable ${envVarName} is not defined.${_notProvidedMessage}.`)
    return null
  }
  if (envVar == null) {
    console.warn(`Environment variable ${envVarName} is not defined. Using default ${defaultValue}.${_notProvidedMessage}.`)
    return defaultValue
  }

  if (envVar !== 'true' && envVar !== 'false') {
    if (defaultValue == null) {
      console.warn(`Environment variable ${envVarName} is not valid (${envVar}).${_invalidMessage}.`)
      return null
    }

    console.warn(`Environment variable ${envVarName} is not valid (${envVar}). Using default ${defaultValue}.${_invalidMessage}.`)
    return defaultValue
  }

  return envVar === 'true'
}

const getEnvironmentVariableString = (
  envVarName: string,
  defaultValue?: string,
  notProvidedMessage?: string,
): string => {
  const _notProvidedMessage = notProvidedMessage != null ? ` ${notProvidedMessage}` : ''
  const envVar = process.env[envVarName]

  if (isProd && envVar === SECRET_KEYWORD)
    throw new Error(`Encountered fatal error while getting environment variable "${envVarName}": Has been left as "${SECRET_KEYWORD}", which indicates that it's likely a production secret.`)

  if (envVar == null && defaultValue == null) {
    console.warn(`Environment variable ${envVarName} is not defined.${_notProvidedMessage}.`)
    return null
  }
  if (envVar == null) {
    console.warn(`Environment variable ${envVarName} is not defined. Using default ${defaultValue}.${_notProvidedMessage}.`)
    return defaultValue
  }

  return envVar
}

const getEnv = (): Env => ({
  isProd,
  port: getEnvironmentVariableNumber('SERVER_PORT', 8080),
})

export const env: Env = getEnv()
