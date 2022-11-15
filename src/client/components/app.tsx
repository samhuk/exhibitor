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

const Links = () => (
  <div className="links">
    <div className="title">Learn the tech:</div>
    <ul>
      <li><a href="https://reactjs.org/" target="_blank" rel="noreferrer">React</a></li>
      <li><a href="https://react-redux.js.org/" target="_blank" rel="noreferrer">React with Redux</a></li>
      <li><a href="https://esbuild.github.io/" target="_blank" rel="noreferrer">esbuild</a></li>
      <li><a href="http://expressjs.com/" target="_blank" rel="noreferrer">express.js</a></li>
      <li><a href="https://www.typescriptlang.org/" target="_blank" rel="noreferrer">Typescript</a></li>
      <li><a href="https://eslint.org/" target="_blank" rel="noreferrer">ESLint</a></li>
      <li><a href="https://jestjs.io/" target="_blank" rel="noreferrer">Jest</a></li>
    </ul>
  </div>
)

export const App = () => {
  const healthcheckStatus = useAppSelector(s => s.healthcheck)
  const dispatch = useAppDispatch()

  if (healthcheckStatus.loadingState === LoadingState.IDLE && !healthcheckStatus.fetched && healthcheckStatus.value == null)
    dispatch(healthcheckArtifacts.fetchThunk())

  return (
    <div className="app">
      <div className="title">web-app-template</div>
      <Links />
      <div className="health-check">
        <div className="title">server health-check:</div>
        <Healthcheck value={healthcheckStatus.value} loadingState={healthcheckStatus.loadingState} error={healthcheckStatus.error} />
      </div>
    </div>
  )
}

export default App
