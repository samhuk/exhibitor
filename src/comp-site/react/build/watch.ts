import chokidar, { FSWatcher } from 'chokidar'
import { watch as _watch } from 'chokidar-debounced'

import { printBuildResult } from '../../../common/esbuilder'
import { COMP_SITE_REACT_SITE_DIR } from '../../../common/paths'
import { build } from './build'
import { CustomBuildResult } from './types'

const startRebuildWatch = (buildResult: CustomBuildResult) => {
  _watch(() => {
    console.log(`[${new Date().toLocaleTimeString()}] Changes detected, rebuilding client...`)
    const startTime = Date.now()
    // Rebuild client
    buildResult.buildResult.rebuild()
      .then(_result => {
        console.log(`(${Date.now() - startTime} ms) Done.`)
        printBuildResult(_result, startTime)
        console.log('Watching for changes...')
      })
      .catch(() => undefined) // Prevent from exiting the process
  }, [COMP_SITE_REACT_SITE_DIR], 150, () => console.log('Watching for changes...'))
}

let initialBuildWatcher: FSWatcher = null
export const watch = () => {
  // Try initial build attempt
  build({
    gzip: false,
    incremental: true,
    sourceMap: true,
    verbose: true,
    /* The comp-site build watch functionality is only ever used in dev, so we
     * can always skip the prebuild when watching and build main.tsx straight to
     * the comp-site bundle.
     */
    skipPrebuild: true,
    reactMajorVersion: 18,
  })
    // If initial build successful, start rebuild watch
    .then(result => {
      initialBuildWatcher?.close()
      startRebuildWatch(result)
    })
    // Else, watch for changes until we get a successful initial build
    .catch(() => {
      if (initialBuildWatcher != null)
        return
      initialBuildWatcher = chokidar.watch([COMP_SITE_REACT_SITE_DIR])
      _watch(() => watch(), initialBuildWatcher, 150, () => console.log('Watching for changes...'))
    })
}
