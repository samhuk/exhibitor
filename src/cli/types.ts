export type Config = {
  /**
   * Optional list of glob patterns to select component exhibit files.
   *
   * @default
   * all .exh.ts files local to config file.
   */
  include?: string[]
  /**
   * List of glob patterns to select files/dirs to watch for changes in order
   * to live-reload the exhibitor site.
   */
  watch: string[]
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
  }
}
