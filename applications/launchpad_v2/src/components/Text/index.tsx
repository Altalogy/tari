import styles from '../../styles/styles'

import { StyledText } from './styles'
import { TextProps } from './types'

/**
 * @name Text
 *
 * @typedef TextProps
 * @prop {'header' | 'subheader' | 'defaultHeavy' | 'defaultMedium' | 'defaultUnder' | 'smallHeavy' | 'smallMedium' | 'smallUnder' | 'microHeavy' | 'microRegular'  | 'microOblique' } type - text styles
 * @prop {ReactNode} children - text content to display
 * @prop {string} [color] - font color
 * @prop {CSSProperties} [style] - styles that will override default styling
 *
 * @example
 * <Text type='defaultMedium' color={styles.colors.dark.primary}>...text goes here...</Text>
 */

const Text = ({
  type = 'defaultMedium',
  color,
  children,
  style,
}: TextProps) => {
  const textStyles = {
    color,
    ...style,
    ...styles.typography[type],
    ...style,
  }

  return (
    <StyledText as={as} style={textStyles} data-testid={testId || 'text-cmp'}>
      {children}
    </StyledText>
  )
}

export default Text
