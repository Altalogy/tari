import { createSlice } from '@reduxjs/toolkit'
import { ThemeType } from '../../styles/themes'

import { AppState, ExpertViewType, ViewType } from './types'

const appInitialState: AppState = {
  expertView: 'hidden',
  view: 'MINING',
  theme: 'light',
}

const appSlice = createSlice({
  name: 'app',
  initialState: appInitialState,
  reducers: {
    toggleExpertView(state, { payload }: { payload: ExpertViewType }) {
      state.expertView = payload
    },
    setTheme(state, { payload }: { payload: ThemeType }) {
      state.theme = payload
    },
    setPage(state, { payload }: { payload: ViewType }) {
      state.view = payload
    }
  },
})

export const { toggleExpertView, setTheme, setPage } = appSlice.actions

const reducer = appSlice.reducer
export default reducer
