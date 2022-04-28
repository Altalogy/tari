import { createSelector } from '@reduxjs/toolkit'
import { NodeType } from './types'

/**
 * Get Redux state of the given mining node
 * @example
 * const miningState = useAppSelector(state => selectMiningNode(state, 'merged'))
 */
export const selectMiningNode = createSelector(
  [state => state.mining, (_, node: NodeType) => node],
  (miningState, node) => miningState[node],
)
