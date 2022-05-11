import { ReactNode, CSSProperties } from 'react'

export type ButtonVariantType =
  | 'primary'
  | 'secondary'
  | 'warning'
  | 'text'
  | 'button-in-text'

export type ButtonSizeType = 'medium' | 'small'

export interface ButtonProps {
  disabled?: boolean
  children?: ReactNode
  style?: CSSProperties
  type?: 'link' | 'button' | 'submit'
  size?: ButtonSizeType
  href?: string
  variant?: ButtonVariantType
  leftIcon?: ReactNode
  rightIcon?: ReactNode
  autosizeIcons?: boolean
  onClick?: () => void
  loading?: boolean
  testId?: string
}
