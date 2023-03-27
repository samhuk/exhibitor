export const EXH_ENV_ENV_VAR_NAME = 'EXH_ENV'

export enum ExhEnv {
  /**
   * An environment solely for develop purposes, such as locally starting Exhibitor with `npm start`.
   */
  DEV = 'DEV',
  /**
   * An environment that mimicks Exhibitor in full release-mode as closely as possible, while still
   * being able to locally be started. This is useful for testing the CLI commands like `npm run cli-config`.
   */
  DEV_REL = 'DEV_REL',
  /**
   * An environment solely for release.
   */
  REL = 'REL',
}

const map: { [envVarValue: string]: ExhEnv } = {
  dev: ExhEnv.DEV,
  'dev-rel': ExhEnv.DEV_REL,
  rel: ExhEnv.REL,
}

export const getEnv = (): ExhEnv => {
  const exhEnvEnvVarValue = process.env[EXH_ENV_ENV_VAR_NAME]
  return map[exhEnvEnvVarValue] ?? ExhEnv.REL
}

export const getIsDemo = () => process.env.EXH_DEMO === 'true'
