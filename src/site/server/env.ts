export type Env = {
  /**
   * The port the server is hosted on.
   *
   * @default 4001
   */
  port: number
  /**
   * The host the server is hosted on.
   *
   * @default 'localhost'
   */
  host: string
  /**
   * Indicated whether exhibitor is being locally tested, i.e. developed on,
   * instead of actually being used by a user.
   */
  isDev: boolean
}

const isDev = process.env.EXH_DEV === 'true'

const getEnvironmentVariableNumber = (
  envVarName: string,
  defaultValue?: number,
  notProvidedMessage?: string,
  invalidMessage?: string,
): number => {
  const _notProvidedMessage = notProvidedMessage != null ? ` ${notProvidedMessage}` : ''
  const _invalidMessage = invalidMessage != null ? ` ${invalidMessage}` : ''

  const envVar = process.env[envVarName]

  if (envVar == null && defaultValue == null) {
    if (isDev)
      console.warn(`Environment variable ${envVarName} is not defined.${_notProvidedMessage}.`)
    return null
  }
  if (envVar == null) {
    if (isDev)
      console.warn(`Environment variable ${envVarName} is not defined. Using default ${defaultValue}.${_notProvidedMessage}.`)
    return defaultValue
  }
  const parsedEnvVar = parseInt(envVar)
  if (Number.isNaN(parsedEnvVar) && defaultValue == null) {
    if (isDev)
      console.warn(`Environment variable ${envVarName} is not valid (${envVar}).${_invalidMessage}.`)
    return null
  }
  if (Number.isNaN(parsedEnvVar)) {
    if (isDev)
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

  if (envVar == null && defaultValue == null) {
    if (isDev)
      console.warn(`Environment variable ${envVarName} is not defined.${_notProvidedMessage}.`)
    return null
  }
  if (envVar == null) {
    if (isDev)
      console.warn(`Environment variable ${envVarName} is not defined. Using default ${defaultValue}.${_notProvidedMessage}.`)
    return defaultValue
  }

  if (envVar !== 'true' && envVar !== 'false') {
    if (defaultValue == null) {
      if (isDev)
        console.warn(`Environment variable ${envVarName} is not valid (${envVar}).${_invalidMessage}.`)
      return null
    }

    if (isDev)
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

  if (envVar == null && defaultValue == null) {
    if (isDev)
      console.warn(`Environment variable ${envVarName} is not defined.${_notProvidedMessage}.`)
    return null
  }
  if (envVar == null) {
    if (isDev)
      console.warn(`Environment variable ${envVarName} is not defined. Using default ${defaultValue}.${_notProvidedMessage}.`)
    return defaultValue
  }

  return envVar
}

const getEnv = (): Env => ({
  port: getEnvironmentVariableNumber('SERVER_PORT', 4001),
  host: getEnvironmentVariableString('SERVER_HOST', 'localhost'),
  isDev: getEnvironmentVariableBoolean('EXH_DEV', false),
})

export const env: Env = getEnv()
