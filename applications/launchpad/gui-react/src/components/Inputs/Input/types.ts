import { ReactNode, CSSProperties, InputHTMLAttributes } from 'react'

export interface InputProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
  type?: string
  disabled?: boolean
  value?: string
  placeholder?: string
  inputUnits?: string
  inputIcon?: ReactNode
  onIconClick?: () => void
  onChange?: (value: string) => void
  testId?: string
  style?: CSSProperties
  containerStyle?: CSSProperties
}
