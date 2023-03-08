import { OmitTyped, TypeDependantBaseIntersection } from '@samhuk/type-helpers'
import { BuildOptions } from 'esbuild'

export type CustomEsbuildBuildOptions = OmitTyped<
  BuildOptions,
  'entryPoints'
  | 'outfile'
  | 'platform'
  | 'format'
  | 'globalName'
  | 'bundle'
  | 'minify'
  | 'sourcemap'
  | 'metafile'
  | 'incremental'
>

export enum Tester {
  PLAYWRIGHT = 'playwright'
}

export type TesterOptions<TTester extends Tester = Tester> = TypeDependantBaseIntersection<
  Tester,
  {
    [Tester.PLAYWRIGHT]: {},
  },
  TTester,
  'type'
>

export type UnresolvedConfig = {
  /**
   * Optional list of glob patterns to select component exhibit files.
   *
   * This is relative to where the config file is.
   *
   * @default ['./**\/*.exh.ts', './**\/*.exh.tsx', './**\/*.exh.js', './**\/*.exh.jsx']
   */
  include?: string[]
  /**
   * Optional list of glob patterns to ignore component exhibit files.
   *
   * This is relative to where the config file is.
   *
   * @default []
   */
  exclude?: string[]
  /**
   * List of glob patterns to select files/dirs to watch for changes in order
   * to live-reload the exhibitor site.
   *
   * This is relative to where the config file is.
   *
   * @default ['./**\/*']
   */
  watch?: string[]
  /**
   * Optional list of glob patterns to ignore files/dirs to watch for changes in order
   * to live-reload the exhibitor site.
   *
   * This is relative to where the config file is.
   *
   * @default []
   */
  watchExclude?: string[]
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
   *
   * @deprecated Use `rootStyles` instead
   */
  rootStyle?: string
  /**
   * Optional path or paths to a CSS or SCSS stylesheet to include as a root style.
   * This is useful for defining styles shared by all components, i.e.
   * icon/style libraries like font-awesome, muicons, bootstrap, or your own.
   *
   * @example
   * "./assets/styles/index-dark.scss"
   * ["./assets/styles/index-dark.scss", "./assets/font-awesome/icons.scss"],
   */
  rootStyles?: string | string[]
  /**
   * List of testers to enable.
   *
   * @example
   *
   * {
   *   "testers": [
   *     { type: 'playwright' }
   *   ]
   * }
   */
  testers?: TesterOptions[]
  /**
   * Custom options to supply to esbuild for building your component library.
   *
   * This is useful if your component library requires esbuild plugins or loaders to be built.
   *
   * Note that some options are excluded such as `format`, since these must be set internally by Exhibitor.
   */
  esbuildOptions?: CustomEsbuildBuildOptions
  /**
   * Optional configuration for the demo deployment (`demo` CLI command).
   */
  demo?: {
    /**
     * Directory that the demo deployment files are built to.
     *
     * @default './.exh/demo'
     */
    outDir?: string
    /**
     * The port the HTTP demo deployment binds to.
     *
     * @default 80
     */
    httpPort?: number
    /**
     * Enables HTTPS functionality for the demo deployment.
     *
     * @default false
     */
    enableHttps?: boolean
    /**
     * The port the HTTPS demo deployment binds to.
     *
     * @default 443
     */
    httpsPort?: number
    /**
     * The domains that the HTTPS certificate will be for.
     *
     * This must be defined if `demo.enableHttps` is `true`.
     *
     * @example "example.org", ["example.org", "www.samhuk.com"]
     */
    httpsDomains?: string | string[]
    /**
     * Directory that the certificates for HTTPS functionality will be stored.
     *
     * @default './certbot'
     */
    certDir?: string
  }
}

export type Config = {
  configDir: string
  rootConfigFile: string | null | undefined
  include: string[]
  exclude: string[]
  watch: string[]
  watchExclude: string[]
  site: {
    host: string
    port: number
    title: string
  }
  verbose: boolean
  rootStyle: string | undefined | null
  rootStyles: string[] | undefined | null
  esbuildOptions?: CustomEsbuildBuildOptions
  testers: TesterOptions[]
  demo: {
    outDir: string
    httpPort: number
    enableHttps: boolean
    httpsPort: number
    httpsDomains: string[]
    certDir: string
  }
}
