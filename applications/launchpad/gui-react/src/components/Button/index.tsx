import Loading from '../Loading'
import Text from '../Text'

import {
  ButtonContentWrapper,
  IconWrapper,
  LoadingIconWrapper,
  StyledButton,
  StyledButtonText,
  StyledLink,
} from './styles'
import { ButtonProps } from './types'

const Button = ({
  children,
  disabled,
  style,
  variant,
  type = 'button',
  size = 'medium',
  href,
  leftIcon,
  rightIcon,
  autosizeIcons = true,
  onClick,
  loading,
  testId = 'button-cmp',
}: ButtonProps) => {
  let btnText = children

  if (typeof children === 'string') {
    btnText = (
      <StyledButtonText size={size}>
        <Text
          as='span'
          type={size === 'small' ? 'smallMedium' : 'defaultMedium'}
        >
          {children}
        </Text>
      </StyledButtonText>
    )
  }

  const btnContent = (
    <>
      {leftIcon ? (
        <IconWrapper
          $spacing={'right'}
          $autosizeIcon={autosizeIcons}
          $variant={variant}
          $disabled={disabled}
        >
          {leftIcon}
        </IconWrapper>
      ) : null}
      <ButtonContentWrapper $variant={variant} disabled={disabled}>
        {btnText}
      </ButtonContentWrapper>
      {rightIcon ? (
        <IconWrapper
          $spacing={'left'}
          $autosizeIcon={autosizeIcons}
          $variant={variant}
          $disabled={disabled}
        >
          {rightIcon}
        </IconWrapper>
      ) : null}
      {loading ? (
        <LoadingIconWrapper>
          <Loading loading size='1em' />
        </LoadingIconWrapper>
      ) : null}
    </>
  )

  if (variant === 'button-in-text') {
    return (
      <StyledLink
        as='button'
        onClick={onClick}
        style={style}
        variant='text'
        data-testid={testId}
        disabled={disabled}
      >
        {btnContent}
      </StyledLink>
    )
  }

  if (type === 'link' || href) {
    return (
      <StyledLink
        href={href}
        onClick={onClick}
        style={style}
        target='_blank'
        variant='text'
        data-testid={testId}
      >
        {btnContent}
      </StyledLink>
    )
  }

  return (
    <StyledButton
      disabled={disabled}
      type={type}
      onClick={onClick}
      style={style}
      variant={variant}
      data-testid={testId}
    >
      {btnContent}
    </StyledButton>
  )
}

export default Button
