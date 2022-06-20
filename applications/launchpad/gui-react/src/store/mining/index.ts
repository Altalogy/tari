import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { v4 as uuidv4 } from 'uuid'

import { MiningNodeType, ScheduleId } from '../../types/general'
import MiningConfig from '../../config/mining'

import {
  startMiningNode,
  stopMiningNode,
  notifyUserAboutMinedTariBlock,
  addMinedTx,
} from './thunks'
import { MiningState, MiningActionReason, MoneroUrl } from './types'
import BigNumber from 'bignumber.js'

const currencies: Record<MiningNodeType, string[]> = {
  tari: ['xtr'],
  merged: ['xtr', 'xmr'],
}

export const initialState: MiningState = {
  tari: {
    session: undefined,
  },
  merged: {
    threads: 1,
    address: undefined,
    urls: MiningConfig.defaultMoneroUrls.map(url => ({ url })),
    authentication: undefined,
    session: undefined,
  },
  notifications: [],
}

const miningSlice = createSlice({
  name: 'mining',
  initialState,
  reducers: {
    /**
     * Add given amount of Tauri (T) to the current node's session.
     * @param {string} action.payload.amount - amount in Tauri (T)
     * @param {MiningNodeType} action.payload.node - node type, ie. 'tari'
     * @param {string} action.payload.txId - the transaction ID
     */
    addMined(
      state,
      action: PayloadAction<{
        amount: string
        node: MiningNodeType
        txId: string
      }>,
    ) {
      const node = action.payload.node

      if (state[node].session?.total) {
        const session = state[node].session

        // check if tx was already processed, so it won't add same funds twice
        if (
          !session ||
          session.history.find(t => t.txId === action.payload.txId)
        ) {
          return
        }

        const nodeSessionTotal = state[node].session?.total?.xtr

        let total = session.total
        if (!total) {
          total = { xtr: '0' }
        }
        total.xtr = new BigNumber(nodeSessionTotal || 0)
          .plus(new BigNumber(action.payload.amount))
          .toString()

        session.history.push({
          txId: action.payload.txId,
          amount: action.payload.amount,
        })
      }
    },
    startNewSession(
      state,
      action: PayloadAction<{
        node: MiningNodeType
        reason: MiningActionReason
        schedule?: ScheduleId
      }>,
    ) {
      const { node, reason, schedule } = action.payload
      const total: Record<string, string> = {}
      currencies[node].forEach(c => {
        total[c] = '0'
      })

      state[node].session = {
        id: uuidv4(),
        startedAt: Number(Date.now()).toString(),
        total,
        reason,
        schedule,
        history: [],
      }
    },
    stopSession(
      state,
      action: PayloadAction<{
        node: MiningNodeType
        reason: MiningActionReason
      }>,
    ) {
      const { node, reason } = action.payload

      const session = state[node].session
      if (session) {
        session.finishedAt = Number(Date.now()).toString()
        session.reason = reason
      }
    },
    setMergedAddress(state, action: PayloadAction<{ address: string }>) {
      const { address } = action.payload
      state.merged.address = address
    },
    setMergedConfig(
      state,
      action: PayloadAction<{
        address?: string
        threads?: number
        urls?: MoneroUrl[]
        authentication?: {
          username?: string
          password?: string
        }
      }>,
    ) {
      state.merged = { ...state.merged, ...action.payload }
    },
    acknowledgeNotification(state) {
      const [_head, ...notificationsLeft] = state.notifications
      state.notifications = notificationsLeft
    },
  },
  extraReducers: builder => {
    builder.addCase(
      notifyUserAboutMinedTariBlock.fulfilled,
      (state, action) => {
        const newNotification = {
          ...action.meta.arg,
          ...action.payload,
        }

        state.notifications = [...state.notifications, newNotification]
      },
    )

    builder.addCase(addMinedTx.fulfilled, (state, action) => {
      const node = action.payload.node
      const session = state[node].session

      if (!session) {
        return
      }

      const nodeSessionTotal = state[node].session?.total?.xtr

      let total = session.total
      if (!total) {
        total = { xtr: '0' }
      }

      total.xtr = new BigNumber(nodeSessionTotal || 0)
        .plus(new BigNumber(action.payload.amount))
        .toString()

      session.history.push({
        txId: action.payload.txId,
        amount: action.payload.amount,
      })
    })
  },
})

const { actions: miningActions } = miningSlice

export const actions = {
  ...miningActions,
  startMiningNode,
  stopMiningNode,
  notifyUserAboutMinedTariBlock,
}

export default miningSlice.reducer
