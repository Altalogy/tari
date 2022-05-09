import { createAsyncThunk } from '@reduxjs/toolkit'

import { MiningNodeType } from '../../types/general'
import { selectServiceStatus } from '../services/selectors'
import { actions as servicesActions } from '../services'
import { Service } from '../services/types'

import { RootState } from '..'

/**
 * Start given mining node
 * @prop {NodeType} node - the node name, ie. 'tari', 'merged'
 * @returns {Promise<void>}
 */
export const startMiningNode = createAsyncThunk<
  void,
  { node: MiningNodeType },
  { state: RootState }
>('mining/startNode', async ({ node }, thunkApi) => {
  try {
    const rootState = thunkApi.getState()

    // Because mining depends on baseNode, then is it enough to check jsut the baseNode status
    // and do not worry here about tor?
    const torStatus = selectServiceStatus(Service.Tor)(rootState)
    const baseNodeStatus = selectServiceStatus(Service.BaseNode)(rootState)
    const walletStatus = selectServiceStatus(Service.Wallet)(rootState)

    if (!torStatus.running && !torStatus.pending) {
      await thunkApi.dispatch(servicesActions.start(Service.Tor)).unwrap()
    }

    if (!baseNodeStatus.running && !baseNodeStatus.pending) {
      await thunkApi.dispatch(servicesActions.start(Service.BaseNode)).unwrap()
    }

    if (!walletStatus.running && !walletStatus.pending) {
      await thunkApi.dispatch(servicesActions.start(Service.Wallet)).unwrap()
    }

    switch (node) {
      case 'tari':
        await thunkApi
          .dispatch(servicesActions.start(Service.SHA3Miner))
          .unwrap()
        break
      case 'merged':
        /**
         * @TODO - convert to `Promise.all?`
         */
        await thunkApi.dispatch(servicesActions.start(Service.MMProxy)).unwrap()
        await thunkApi.dispatch(servicesActions.start(Service.Monerod)).unwrap()
        await thunkApi.dispatch(servicesActions.start(Service.XMrig)).unwrap()
        break
      default:
        break
    }
  } catch (e) {
    return thunkApi.rejectWithValue(e)
  }
})

/**
 * Stop given mining node
 * @prop {NodeType} node - the node name, ie. 'tari', 'merged'
 * @returns {Promise<void>}
 */
export const stopMiningNode = createAsyncThunk<
  void,
  { node: MiningNodeType },
  { state: RootState }
>('mining/stopNode', async ({ node }, thunkApi) => {
  try {
    switch (node) {
      case 'tari':
        await thunkApi
          .dispatch(servicesActions.stop(Service.SHA3Miner))
          .unwrap()
        break
      case 'merged':
        await thunkApi.dispatch(servicesActions.stop(Service.MMProxy)).unwrap()
        await thunkApi.dispatch(servicesActions.stop(Service.Monerod)).unwrap()
        await thunkApi.dispatch(servicesActions.stop(Service.XMrig)).unwrap()
        break
      default:
        break
    }
  } catch (e) {
    return thunkApi.rejectWithValue(e)
  }
})
