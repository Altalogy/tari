import { ReactNode } from 'react'
import { TagType } from '../Tag/types'

export interface NodeBoxProps {
  title?: string
  tag?: {
    text: string
    type?: TagType
  }
  children?: ReactNode
}
