import { createSlice } from '@reduxjs/toolkit'

import { ThemeType } from '../../styles/themes/types'
import { Schedule } from '../../types/general'

import { AppState, ExpertViewType, ViewType } from './types'

const test = new Date('2022-05-19')
test.setHours(0)
test.setMinutes(0)
test.setSeconds(0)
test.setMilliseconds(0)

const appInitialState: AppState = {
  expertView: 'hidden',
  view: 'MINING',
  theme: 'light',
  schedules: {
    asdf: {
      id: 'asdf',
      enabled: true,
      date: test,
      interval: {
        from: { hours: 0, minutes: 0 },
        to: { hours: 19, minutes: 35 },
      },
      type: ['merged'],
    },
    qwer: {
      id: 'qwer',
      enabled: false,
      days: [4, 5],
      interval: {
        from: { hours: 12, minutes: 32 },
        to: { hours: 15, minutes: 34 },
      },
      type: ['merged', 'tari'],
    },
    wqer1: {
      id: 'wqer1',
      enabled: true,
      date: new Date('2022-05-14'),
      interval: {
        from: { hours: 13, minutes: 7 },
        to: { hours: 23, minutes: 59 },
      },
      type: ['merged', 'tari'],
    },
    asdf2: {
      id: 'asdf2',
      enabled: false,
      date: new Date('2022-05-14'),
      interval: {
        from: { hours: 7, minutes: 0 },
        to: { hours: 15, minutes: 0 },
      },
      type: ['merged', 'tari'],
    },
  },
}

const appSlice = createSlice({
  name: 'app',
  initialState: appInitialState,
  reducers: {
    setExpertView(state, { payload }: { payload: ExpertViewType }) {
      state.expertView = payload
    },
    setTheme(state, { payload }: { payload: ThemeType }) {
      state.theme = payload
    },
    setPage(state, { payload }: { payload: ViewType }) {
      state.view = payload
    },
    toggleSchedule(state, { payload: scheduleId }: { payload: string }) {
      state.schedules[scheduleId].enabled = !state.schedules[scheduleId].enabled
    },
    removeSchedule(state, { payload: scheduleId }: { payload: string }) {
      delete state.schedules[scheduleId]
    },
    updateSchedule(
      state,
      { payload }: { payload: { scheduleId: string; value: Schedule } },
    ) {
      console.log('update schedule', payload)
    },
  },
})

export const {
  setExpertView,
  setTheme,
  setPage,
  toggleSchedule,
  removeSchedule,
  updateSchedule,
} = appSlice.actions

const reducer = appSlice.reducer
export default reducer
