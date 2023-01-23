import { applyMiddleware, combineReducers, configureStore } from '@reduxjs/toolkit'
import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux'
import thunkMiddleware from 'redux-thunk'
import { testingReducer } from './testing/reducer'
import { exhibitCodeReducer } from './componentExhibits/exhibitCode/reducer'

import { componentExhibitsReducer } from './componentExhibits/reducer'
import { healthcheckArtifacts } from './healthcheck'
import { init } from './init'
import { metaDataReducer } from './metadata/reducer'
import { themeReducer } from './theme/reducer'
import { AppDispatch, RootState } from './types'

// Set the root reducer. This defines the root state (see ./types.ts).
export const rootReducer = combineReducers({
  componentExhibits: componentExhibitsReducer,
  healthcheck: healthcheckArtifacts.reducer,
  metaData: metaDataReducer,
  theme: themeReducer,
  exhibitCode: exhibitCodeReducer,
  testing: testingReducer,
})

export const store = configureStore({
  // Add the root reducer
  reducer: rootReducer,
  // Enable the redux devtools extension
  devTools: (window as any).__REDUX_DEVTOOLS_EXTENSION__ && (window as any).__REDUX_DEVTOOLS_EXTENSION__(),
  // Add thunk middleware for non-boilerplate async dispatching of actions
  enhancers: [applyMiddleware(thunkMiddleware)],
})

export default store

export const useAppDispatch: () => AppDispatch = useDispatch

export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector

init(store.dispatch)
