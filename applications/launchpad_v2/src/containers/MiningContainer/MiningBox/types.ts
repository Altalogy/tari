import { ReactNode } from 'react'
import { TagType } from '../../../components/Tag/types'
import { MiningNodesStatus, NodeType } from '../../../store/mining/types'

export interface NodeBoxStatusConfig {
  tag: {
    text: string
    type: TagType
  }
}

export interface MiningBoxProps {
  node: NodeType
  statuses?: Record<keyof MiningNodesStatus, NodeBoxStatusConfig>
  children?: ReactNode
}
