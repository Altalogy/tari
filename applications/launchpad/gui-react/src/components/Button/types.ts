import { ReactNode, CSSProperties } from 'react'

export type ButtonVariantType =
  | 'primary'
  | 'secondary'
  | 'warning'
  | 'text'
  | 'button-in-text'

export interface ButtonProps {
  disabled?: boolean
  children?: ReactNode
  style?: CSSProperties
  type?: 'link' | 'button' | 'submit'
  href?: string
  variant?: ButtonVariantType
  leftIcon?: ReactNode
  rightIcon?: ReactNode
  autosizeIcons?: boolean
  onClick?: () => void
  loading?: boolean
  testId?: string
}
