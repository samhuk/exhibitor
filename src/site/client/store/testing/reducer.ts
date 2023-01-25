import { combineReducers } from '@reduxjs/toolkit'
import { playwrightReducer } from './playwright/reducer'

export const testingReducer = combineReducers({
  playwright: playwrightReducer,
})
