import { ReactNode } from 'react'
import { CSSProperties } from 'styled-components'

export type TagVariantType = 'small' | 'large'
export type TagType = 'info' | 'running' | 'warning' | 'expert' | 'light'

/**
 * @typedef TagProps
 *
 * @prop {ReactNode} [children] - text content to display
 * @prop {CSSProperties} [style] - optional component styles
 * @prop {'info' | 'running' | 'warning' | 'expert'} [type] - tag types to determine color settings
 * @prop {ReactNode} [icon] - optional SVG icon
 * @prop {ReactNode} [subText] - optional additional tag text
 * @prop {TagVariantType} [variant] - small or large size tag
 * @prop {boolean} [inverted] - boolean indicated if inverted colors should be used
 * @prop {boolean} [dashboard] - boolean indicating if tag is used in Dashboard tabs section
 * @prop {boolean} [inverted] - optional prop indicating whether tag should be rendered in inverted coloring

 */

export interface TagProps {
  children?: ReactNode
  style?: CSSProperties
  type?: TagType
  variant?: TagVariantType
  icon?: ReactNode
  subText?: ReactNode
  inverted?: boolean
  dashboard?: boolean
  expertSec?: boolean
}
