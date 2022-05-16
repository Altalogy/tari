import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { MiningNodeType } from '../../types/general'
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
  // extraReducers: builder => {
  //   builder
  //     .addCase(startMiningNode.pending, (state, action) => {
  //       const node = action.meta.arg.node
  //       if (node in state) {
  //         state[node].pending = true
  //       }
  //     })
  //     .addCase(startMiningNode.fulfilled, (state, action) => {
  //       const node = action.meta.arg.node
  //       if (node in state) {
  //         state[node].pending = false
  //         state[node].status = MiningNodesStatus.RUNNING
  //       }
  //     })
  //     .addCase(stopMiningNode.pending, (state, action) => {
  //       const node = action.meta.arg.node
  //       if (node in state) {
  //         state[node].pending = true
  //       }
  //     })
  //     .addCase(stopMiningNode.fulfilled, (state, action) => {
  //       const node = action.meta.arg.node
  //       if (node in state) {
  //         state[node].pending = false
  //         state[node].status = MiningNodesStatus.PAUSED
  //       }
  //     })
  // },
})

const { actions: miningActions } = miningSlice

export const actions = {
  ...miningActions,
  startMiningNode,
  stopMiningNode,
}

export default miningSlice.reducer
