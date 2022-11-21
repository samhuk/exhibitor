import React from 'react'
import { HealthcheckStatus } from '../../common/responses'

// styles
import '../assets/styles/standard.scss'

import { useAppDispatch, useAppSelector } from '../store'
import { healthcheckArtifacts } from '../store/healthcheck'
import { LoadingState } from '../store/types'

const Healthcheck = (props: { value: HealthcheckStatus, loadingState: LoadingState, error: any }) => {
  if (props.loadingState === LoadingState.IDLE) {
    if (props.value != null) {
      return (
        <pre>
          {JSON.stringify(props.value, null, 2)}
        </pre>
      )
    }

    return (
      <div><pre>[Healthcheck empty]</pre></div>
    )
  }
  if (props.loadingState === LoadingState.FETCHING) {
    return (
      <pre>
        Healthcheck loading...
      </pre>
    )
  }

  return (
    <pre>
      Healthcheck failed...{props.error}
    </pre>
  )
}

const ComponentExhibits = () => {
  const componentExhibits = useAppSelector(s => s.componentExhibits)

  if (!componentExhibits.ready)
    return <div>Waiting for component exhibits to load...</div>

  return (
    <div>
      {exh.default.map(exhibit => (
        exhibit.variants.map((variant, i) => (
          <div key={i + 1}>
            <div>{variant.name}</div>
            <div>{exhibit.renderFn(variant.props)}</div>
          </div>
        ))
      ))}
    </div>
  )
}

export const App = () => {
  const healthcheckStatus = useAppSelector(s => s.healthcheck)
  const dispatch = useAppDispatch()

  if (healthcheckStatus.loadingState === LoadingState.IDLE && !healthcheckStatus.fetched && healthcheckStatus.value == null)
    dispatch(healthcheckArtifacts.fetchThunk())

  return (
    <div className="app">
      <div className="title">Exhibitor</div>
      <ComponentExhibits />
    </div>
  )
}

export default App
