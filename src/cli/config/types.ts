import { BoolDependant } from '@samhuk/type-helpers'

export type Config = {
  /**
   * Optional list of glob patterns to select component exhibit files.
   *
   * This is relative to where the config file is.
   *
   * @default
   * all .exh.ts files local to config file.
   */
  include?: string[]
  /**
   * List of glob patterns to select files/dirs to watch for changes in order
   * to live-reload the exhibitor site.
   *
   * This is relative to where the config file is.
   */
  watch?: string[]
  /**
   * Optional configuration of the exhibitor site.
   */
  site?: {
    /**
     * The port the site will be binded to.
     *
     * @default 4001
     */
    port?: number
    /**
     * The host the site will be binded to.
     *
     * @default 'localhost'
     */
    host?: string
    /**
     * Optional title for the browser page of the site.
     *
     * @default 'Exhibitor'
     */
    title?: string
  }
  verbose?: boolean
  /**
   * Optional path to a CSS or SCSS stylesheet to include as a root style.
   * This is useful for defining styles shared by all components, i.e.
   * icon/style libraries like font-awesome, muicons, bootstrap, or your own.
   */
  rootStyle?: string
}

export type ResolvedConfig = {
  configDir: string
  include: string[]
  watch: string[]
  site: {
    host: string
    port: number
    title: string
  }
  verbose: boolean
  rootStyle: string | undefined | null
}

export type ValidateConfigResult<TSuccess extends boolean = boolean> = BoolDependant<{
  true: {},
  false: {
    reason: string
  }
}, TSuccess>
