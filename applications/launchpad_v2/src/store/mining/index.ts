import { createSlice } from '@reduxjs/toolkit'
import { startMiningNode, stopMiningNode } from './thunks'

import { MiningNodesStatus, MiningState, NodeType } from './types'

export const initialState: MiningState = {
  tari: {
    pending: false,
    status: MiningNodesStatus.UNKNOWN,
  },
  merged: {
    pending: false,
    status: MiningNodesStatus.RUNNING,
  },
}

const miningSlice = createSlice({
  name: 'mining',
  initialState,
  reducers: {
    setNodeStatus(
      state,
      { payload }: { payload: { node: NodeType; status: MiningNodesStatus } },
    ) {
      state[payload.node].status = payload.status
    },
  },
  extraReducers: builder => {
    builder
      .addCase(startMiningNode.pending, (state, action) => {
        const node = action.meta.arg.node
        if (node in state) {
          state[node].pending = true
        }
      })
      .addCase(startMiningNode.fulfilled, (state, action) => {
        const node = action.meta.arg.node
        if (node in state) {
          state[node].pending = false
          state[node].status = MiningNodesStatus.RUNNING
        }
      })
      .addCase(stopMiningNode.pending, (state, action) => {
        const node = action.meta.arg.node
        if (node in state) {
          state[node].pending = true
        }
      })
      .addCase(stopMiningNode.fulfilled, (state, action) => {
        const node = action.meta.arg.node
        if (node in state) {
          state[node].pending = false
          state[node].status = MiningNodesStatus.PAUSED
        }
      })
  },
})

const { setNodeStatus } = miningSlice.actions
export const actions = {
  setNodeStatus,
  startMiningNode,
  stopMiningNode,
}

export default miningSlice.reducer
