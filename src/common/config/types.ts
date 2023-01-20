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
   * @default ['']
   * all .exh.ts files local to config file.
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
}

export type Config = {
  configDir: string
  rootConfigFile: string | null | undefined
  include: string[]
  exclude: string[]
  watch: string[]
  site: {
    host: string
    port: number
    title: string
  }
  verbose: boolean
  rootStyle: string | undefined | null
  esbuildOptions?: CustomEsbuildBuildOptions
  testers: TesterOptions[]
}
