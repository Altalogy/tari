import styled, { keyframes } from 'styled-components'

const spinKeyframes = keyframes`
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
`

export const StyledSpan = styled.span`
  animation: ${spinKeyframes} infinite 2s linear;
`
