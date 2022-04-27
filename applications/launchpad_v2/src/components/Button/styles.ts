/* eslint-disable indent */
import styled from 'styled-components'

import { ButtonProps } from './types'

export const StyledButton = styled.button<
  Pick<ButtonProps, 'variant' | 'type'>
>`
  display: flex;
  position: relative;
  justify-content: space-between;
  align-items: baseline;
  border-radius: ${({ theme }) => theme.tightBorderRadius()};
  border: ${({ theme, variant, type }) => {
    if (variant === 'text') {
      return 'none'
    }

    if (type === 'reset') {
      return '1px solid transparent'
    }

    return `1px solid ${theme.accent}`
  }};
  box-shadow: none;
  padding: ${({ theme }) => theme.spacingVertical()}
    ${({ theme }) => theme.spacingHorizontal()};
  cursor: pointer;
  background: ${({ variant, type, theme }) => {
    if (type === 'reset') {
      return theme.resetBackground
    }

    return variant === 'text' ? 'transparent' : theme.tariGradient
  }};
  color: ${({ variant, theme }) =>
    variant === 'text' ? theme.secondary : theme.inverted.primary};
  outline: none;

  & * {
    color: inherit;
  }

  &:hover {
    background: ${({ variant, theme, type }) => {
      if (variant === 'text') {
        return 'auto'
      }

      if (type === 'reset') {
        return theme.resetBackgroundDark
      }

      return theme.accent
    }};
  }
`

export const DisabledButton = styled(StyledButton)<
  Pick<ButtonProps, 'variant' | 'type'>
>`
  cursor: default;
  color: ${({ theme }) => theme.disabledText};
  background: ${({ theme }) => theme.backgroundImage};
  border-color: transparent;

  &:hover {
    color: ${({ theme }) => theme.disabledText};
    background: ${({ theme }) => theme.backgroundImage};
    border-color: transparent;
  }
`

export const StyledLink = styled.a<Pick<ButtonProps, 'variant'>>`
  background: ${({ variant, theme }) =>
    variant === 'text' ? 'transparent' : theme.tariGradient};
  color: ${({ variant, theme }) =>
    variant === 'text' ? theme.secondary : theme.primary};
`

export const ButtonText = styled.span``

export const IconWrapper = styled.span``

export const LoadingIconWrapper = styled.span`
  margin-left: 0.25em;
  transform: translateY(0.25em);
`
