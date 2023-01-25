import React from 'react'
import LoadingCover from '../../../../../common/loadingIndicators/loadingCover'

import { useAppSelector } from '../../../../../store'
import { LoadingState } from '../../../../../store/types'

const render = () => {
  const loadingState = useAppSelector(s => s.testing.playwright.loadingState)
  return loadingState === LoadingState.FETCHING
    ? <LoadingCover iconName="flask" />
    : null
}

export default render
