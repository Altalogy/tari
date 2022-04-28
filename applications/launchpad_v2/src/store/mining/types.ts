export type NodeType = 'tari' | 'merged'

export enum MiningNodesStatus {
  'UNKNOWN' = 'UNKNOWN',
  'SETUP_REQUIRED' = 'SETUP_REQUIRED',
  'PAUSED' = 'PAUSED',
  'RUNNING' = 'RUNNING',
  'ERROR' = 'ERROR',
}

export enum DisabledReasonTari {
  'MISSING_WALLET_ADDRESS',
}

export enum DisabledReasonMerged {
  'MISSING_WALLET_ADDRESS',
  'MISSING_MONERO_ADDRESS',
}

export interface MiningNodeState<TDisabledReason> {
  pending: boolean
  status: MiningNodesStatus
  disabledReason?: TDisabledReason
}

export type TariMiningNodeState = MiningNodeState<DisabledReasonTari>
export type MergedMiningNodeState = MiningNodeState<DisabledReasonMerged>

export type MiningNodeStates = TariMiningNodeState | MergedMiningNodeState

export interface MiningState {
  tari: TariMiningNodeState
  merged: MergedMiningNodeState
}
