import store, { rootReducer } from '.'

export type RootState = ReturnType<typeof rootReducer>

export type AppDispatch = typeof store.dispatch

export type Store = typeof store

export enum LoadingState {
  IDLE = 'idle',
  FETCHING = 'fetching',
  SENDING = 'sending',
  FAILED = 'failed',
}
