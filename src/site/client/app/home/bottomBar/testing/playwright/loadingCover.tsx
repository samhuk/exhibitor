import React from 'react'
import LoadingCover from '../../../../../../../ui-component-library/loading-cover'

import { useAppSelector } from '../../../../../store'
import { LoadingState } from '../../../../../store/types'

const render = () => {
  const loadingState = useAppSelector(s => s.testing.playwright.loadingState)
  return loadingState === LoadingState.FETCHING
    ? <LoadingCover iconName="flask" />
    : null
}

export default render
