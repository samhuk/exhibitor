import { ExhibitNodes, PathTree } from '../../../api/exhibit/types'
import { DEFAULT_INTERCOM_PORT } from '../../../common/intercom'
import { createIntercomClient } from '../../../common/intercom/client'
import { IntercomIdentityType } from '../../../common/intercom/types'
import { getTheme } from '../connectors/theme'
import { componentExhibitsReady } from './componentExhibits/actions'
import { setStatus } from './intercom/actions'
import { fetchMetaDataThunk } from './metadata/reducer'
import { setTheme } from './theme/actions'
import { AppDispatch } from './types'

const areComponentExhibitsLoaded = () => {
  try {
    return (window as any).exh != null
  }
  catch {
    return false
  }
}

const waitUntilComponentExhibitsAreLoaded = (): Promise<{ nodes: ExhibitNodes, pathTree: PathTree }> => new Promise((res, rej) => {
  if (areComponentExhibitsLoaded()) {
    res((window as any).exh)
    return
  }

  let i = 0
  const interval = setInterval(() => {
    i += 1
    if (i > 100) {
      console.log('component exhibits didnt load. Did index.exh.ts build correctly?')
      clearTimeout(interval)
    }
    console.log('Checking if component exhibits are ready...')
    if (areComponentExhibitsLoaded()) {
      clearTimeout(interval)
      res((window as any).exh)
    }
  }, 50)
})

export const init = async (dispatch: AppDispatch) => {
  // Restore saved theme
  const savedTheme = getTheme()
  if (savedTheme != null)
    dispatch(setTheme(savedTheme))

  await waitUntilComponentExhibitsAreLoaded()
  dispatch(componentExhibitsReady(null))
  dispatch(fetchMetaDataThunk(async metaData => {
    const intercomClient = createIntercomClient({
      identityType: IntercomIdentityType.SITE_CLIENT,
      webSocketCreator: url => new WebSocket(url),
      // eslint-disable-next-line no-restricted-globals
      host: metaData.intercom.host,
      port: metaData.intercom.port,
      enableLogging: metaData.intercom.enableLogging,
      events: {
        onStatusChange: newStatus => {
          dispatch(setStatus(newStatus))
        },
        onMessage: () => {
          /* TODO: We might not have to reload here in prod/release env, since the site only actually consumes the metadata part of index.exh.js,
           * so we could just reload the comp-site and refresh all the redux state here. However, much re-architecturing needs to be done before that.
           * For now, we will just reload whenever the client reconnects.
           */
          // eslint-disable-next-line no-restricted-globals
          location.reload()
        },
        onReconnect: () => {
          // eslint-disable-next-line no-restricted-globals
          location.reload()
          return { proceed: false }
        },
      },
    })

    await intercomClient.connect()
  }))
}
