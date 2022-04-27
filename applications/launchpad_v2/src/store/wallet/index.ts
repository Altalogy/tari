import { createSlice, PayloadAction } from '@reduxjs/toolkit'

import { WalletState } from './types'
import { unlockWallet } from './thunks'

const initialState: WalletState = {
  running: false,
  pending: false,
  unlocked: false,
  address: '',
  tari: {
    balance: 0,
    available: 0,
  },
}

const walletSlice = createSlice({
  name: 'wallet',
  initialState,
  reducers: {},
  extraReducers: builder => {
    builder.addCase(unlockWallet.pending, state => {
      state.pending = true
    })
    builder.addCase(unlockWallet.fulfilled, (state, action) => {
      console.log({ action })
      state.pending = false
      state.unlocked = true
    })
  },
})

export const actions = {
  unlockWallet,
}

export default walletSlice.reducer
