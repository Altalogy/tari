import { createAsyncThunk } from '@reduxjs/toolkit'

import { MiningNodeType } from '../../types/general'
import { selectContainerStatus } from '../containers/selectors'
import { actions as containersActions } from '../containers'
import { Container } from '../containers/types'

import { RootState } from '..'

/**
 * Start given mining node. It spawns all dependencies if needed.
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

    const torStatus = selectContainerStatus(Container.Tor)(rootState)
    const baseNodeStatus = selectContainerStatus(Container.BaseNode)(rootState)
    const walletStatus = selectContainerStatus(Container.Wallet)(rootState)

    if (!torStatus.running && !torStatus.pending) {
      await thunkApi.dispatch(containersActions.start(Container.Tor)).unwrap()
    }

    if (!baseNodeStatus.running && !baseNodeStatus.pending) {
      await thunkApi
        .dispatch(containersActions.start(Container.BaseNode))
        .unwrap()
    }

    if (!walletStatus.running && !walletStatus.pending) {
      await thunkApi
        .dispatch(containersActions.start(Container.Wallet))
        .unwrap()
    }

    switch (node) {
      case 'tari':
        await thunkApi
          .dispatch(containersActions.start(Container.SHA3Miner))
          .unwrap()
        break
      case 'merged':
        await thunkApi
          .dispatch(containersActions.start(Container.MMProxy))
          .unwrap()
        await thunkApi
          .dispatch(containersActions.start(Container.XMrig))
          .unwrap()
        break
      default:
        break
    }
  } catch (e) {
    return thunkApi.rejectWithValue(e)
  }
})

/**
 * Stop nodes with given IDs
 * @prop {{ id: string; type: Container }[]} containers - the list of nodes with id and type
 * @returns {Promise<void>}
 */
export const stopMiningNode = createAsyncThunk<
  void,
  { containers: { id: string; type: Container }[] },
  { state: RootState }
>('mining/stopNode', async ({ containers }, thunkApi) => {
  try {
    const promises = containers.map(async c => {
      await thunkApi.dispatch(containersActions.stop(c.id)).unwrap()
    })
    await Promise.all(promises)
  } catch (e) {
    return thunkApi.rejectWithValue(e)
  }
})
