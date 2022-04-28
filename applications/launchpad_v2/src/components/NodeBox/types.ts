export type NodeBoxStatusType = 'inactive' | 'active'

export interface NodeBoxProps {
  title?: string
  status?: NodeBoxStatusType
}
