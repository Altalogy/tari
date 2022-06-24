import { forwardRef, ReactNode, ForwardedRef, useState, useRef } from 'react'
import { useSpring } from 'react-spring'
import { useTheme } from 'styled-components'
import SvgArrowRight from '../../../styles/Icons/ArrowRight'
import Button from '../../Button'
import t from '../../../locales'
import {
  MessageSpaceContainer,
  StyledMessage,
  StyledMessageBox,
  MessageSlideIn,
  SkipButtonContainer,
} from './styles'
import React from 'react'

/**
 * Component renders the message wrapped with elements allowing to perform
 * fade-in animation.
 */
const MessageBox = (
  {
    animate,
    children,
    skipButton,
    onSkip,
    floating,
  }: {
    animate: boolean
    children: ReactNode
    skipButton?: boolean
    onSkip?: () => void
    floating?: boolean
  },
  ref?: ForwardedRef<HTMLDivElement>,
) => {
  const messageBoxRef = useRef<HTMLDivElement | null>(null)
  const [heightCtrl, setHeightCtrl] = useState<number | string | undefined>()

  const useOpacityAnim = useSpring({
    from: { opacity: animate ? 0 : 1 },
    to: { opacity: 1 },
    delay: 900,
  })

  const useSlideInAnim = useSpring({
    from: { top: animate ? 40 : 0 },
    to: { top: 0 },
    delay: 800,
  })

  const theme = useTheme()

  const updateMessageBoxSize = () => {
    if (messageBoxRef.current) {
      setHeightCtrl(messageBoxRef.current.clientHeight)
    }
  }

  return (
    <StyledMessageBox ref={ref}>
      <StyledMessage
        style={{ opacity: 0, height: heightCtrl ? heightCtrl : 'auto' }}
        $skipButton={skipButton}
        $floating={floating}
      >
        {children}
      </StyledMessage>
      <MessageSpaceContainer>
        <MessageSlideIn style={{ ...useSlideInAnim }}>
          <StyledMessage
            ref={messageBoxRef}
            style={{ ...useOpacityAnim }}
            $skipButton={skipButton}
            $floating={floating}
          >
            {React.Children.map(children, child => {
              if (React.isValidElement(child)) {
                return React.cloneElement(child, { updateMessageBoxSize })
              }
              return child
            })}
            {skipButton && (
              <SkipButtonContainer>
                <Button
                  style={{
                    textDecoration: 'none',
                    color: theme.secondary,
                  }}
                  variant='button-in-text'
                  rightIcon={<SvgArrowRight fontSize={24} />}
                  autosizeIcons={false}
                  onClick={onSkip}
                >
                  {t.onboarding.actions.skipChatting}
                </Button>
              </SkipButtonContainer>
            )}
          </StyledMessage>
        </MessageSlideIn>
      </MessageSpaceContainer>
    </StyledMessageBox>
  )
}

export default forwardRef(MessageBox)
