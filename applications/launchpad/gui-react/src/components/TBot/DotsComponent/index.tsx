import { useEffect, useRef } from 'react'
import lottie from 'lottie-web'
import dotsChatLottie from '../../../styles/lotties/tbot-dots-animation.json'
import { DotsContainer, StyledRow } from './styles'

/**
 * @name ChatDots
 */

const ChatDots = () => {
  const animation = useRef(null)
  useEffect(() => {
    if (animation.current) {
      lottie.loadAnimation({
        name: 'dotsAnimation',
        container: animation.current,
        renderer: 'svg',
        loop: true,
        autoplay: true,
        animationData: dotsChatLottie,
      })
    }
    return () => {
      try {
        lottie.destroy()
      } catch (err) {
        console.log(err)
      }
    }
  }, [animation])

  return (
    <StyledRow>
      <DotsContainer ref={animation} />
    </StyledRow>
  )
}

export default ChatDots
