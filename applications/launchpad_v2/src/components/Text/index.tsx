import { StyledText } from './styles'
import { TextProps } from './types'
import styles from '../../styles/styles'

/**
 * @name Text
 *
 * @typedef TextProps
 * @prop {'header' | 'subheader' | 'defaultHeavy' | 'defaultMedium' | 'defaultUnder' | 'smallHeavy' | 'smallMedium' | 'smallUnder' | 'microHeavy' | 'microRegular'  | 'microOblique' } type - text styles
 * @prop {ReactNode} children - text content to display
 * @prop {string} [color] - font color
 *
 * @example
 * <Text type='defaultMedium' color={styles.colors.dark.primary}>...text goes here...</Text>
 */

const Text = ({
  type = 'defaultMedium',
  color,
  children,
  as = 'p',
  color,
  children,
  style,
  testId,
}: TextProps) => {
  const textStyles = {
    color,
    ...style,
    ...styles.typography[type],
  }

  return (
    <StyledText as={as} style={textStyles} data-testid={testId || 'text-cmp'}>
      {children}
    </StyledText>
  )
}

export default Text
