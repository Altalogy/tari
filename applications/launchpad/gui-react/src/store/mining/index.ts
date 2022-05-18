import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { startMiningNode, stopMiningNode } from './thunks'

import { MiningState } from './types'

export const initialState: MiningState = {
  tari: {
    sessions: [
      {
        total: {
          xtr: '1000',
        },
      },
      {
        total: {
          xtr: '2000',
        },
      },
    ],
  },
  merged: {
    addresses: [],
    sessions: [
      {
        total: {
          xtr: '1000',
          xmr: '1001',
        },
      },
      {
        total: {
          xtr: '2000',
          xmr: '2001',
        },
      },
    ],
  },
}

const miningSlice = createSlice({
  name: 'mining',
  initialState,
  reducers: {
    /**
     * @TODO - mock that need to be removed later. It is used along with timers in App.tsx
     * to increase the amount of mined Tari and Merged
     */
    addAmount(
      state,
      action: PayloadAction<{ amount: string; node: 'tari' | 'merged' }>,
    ) {
      const node = action.payload.node

      state[node].sessions![state[node].sessions!.length - 1].total!.xtr = (
        Number(
          state[node].sessions![state[node].sessions!.length - 1].total!.xtr,
        ) + Number(action.payload.amount)
      ).toString()
    },
  },
})

const { actions: miningActions } = miningSlice

export const actions = {
  ...miningActions,
  startMiningNode,
  stopMiningNode,
}

export default miningSlice.reducer
