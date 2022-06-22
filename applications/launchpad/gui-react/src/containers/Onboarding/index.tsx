import { useState, useEffect } from 'react'
import { useTheme } from 'styled-components'
import TBotPrompt from '../../components/TBot/TBotPrompt'
import { TBotMessage } from '../../components/TBot/TBotPrompt/types'
import { OnboardingMessagesMap } from '../../config/onboardingMessagesConfig'
import { StyledOnboardingContainer } from './styles'

const OnboardingContainer = () => {
  const theme = useTheme()
  const [trigger, fireTrigger] = useState(false)

  const [messages, setMessages] = useState(OnboardingMessagesMap)
  //const messages: TBotMessage[] = []

  // If we use currentIndex = 1, it will not show loading dots before rendering first message
  const [current, setCurrent] = useState(1)

  useEffect(() => {
    if (trigger) {
      const newMsgs = messages.slice()
      newMsgs.push({ content: 'Newly pushed', barFill: 0 })
      setMessages(newMsgs)
      setCurrent(newMsgs.length - 1)
      const hideLoadingDots = () => {
        setCurrent(newMsgs.length)
      }
      hideLoadingDots()
      fireTrigger(false)
    }
  }, [trigger])

  return (
    <StyledOnboardingContainer>
      <TBotPrompt
        open={true}
        messages={messages}
        currentIndex={current}
        closeIcon={false}
        mode='onboarding'
        floating={false}
      />
    </StyledOnboardingContainer>
  )
}

export default OnboardingContainer
