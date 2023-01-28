import { IntercomStatus } from '../../../../common/intercom/client'

export const SET_STATUS = 'intercom/setStatus'

export type State = {
  status: IntercomStatus
}

type SetStatusAction = {
  type: typeof SET_STATUS
  status: IntercomStatus
}

export type Actions = SetStatusAction

export const setStatus = (newStatus: IntercomStatus): Actions => ({
  type: SET_STATUS,
  status: newStatus,
})
