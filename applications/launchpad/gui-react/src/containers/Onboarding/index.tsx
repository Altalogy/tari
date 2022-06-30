import { useState, useEffect, useRef } from 'react'
import { isDockerInstalled } from '../../commands'

import Button from '../../components/Button'
import TBotPrompt from '../../components/TBot/TBotPrompt'
import { TBotMessage } from '../../components/TBot/TBotPrompt/types'
import {
  OnboardingMessagesIntro,
  OnboardingMessagesDockerInstall,
  OnboardingMessagesDockerInstallAfter,
  DownloadImagesMessage,
  DownloadImagesErrorMessage,
  BlockchainSyncStep,
} from '../../config/onboardingMessagesConfig'
import { setOnboardingComplete } from '../../store/app'
import { selectOnboardingCheckpoint } from '../../store/app/selectors'
import { OnboardingCheckpoints } from '../../store/app/types'
import { useAppDispatch, useAppSelector } from '../../store/hooks'
import { StyledOnboardingContainer } from './styles'

const OnboardingContainer = () => {
  const dispatch = useAppDispatch()

  const messagesRef = useRef<TBotMessage[]>()

  const lastOnboardingCheckpoint = useAppSelector(selectOnboardingCheckpoint)

  const [messages, setMessages] = useState(OnboardingMessagesIntro)
  const [dockerInstalled, setDockerInstalled] = useState<boolean | undefined>(
    undefined,
  )
  const [current, setCurrent] = useState(1)
  const [tBotIndex, setTBotIndex] = useState(1)

  messagesRef.current = messages

  const checkDocker = async () => {
    const isDocker = await isDockerInstalled()
    setDockerInstalled(isDocker)
    if (
      isDocker &&
      lastOnboardingCheckpoint === OnboardingCheckpoints.DOCKER_INSTALL
    ) {
      setMessages(
        OnboardingMessagesDockerInstallAfter.concat([
          {
            content: () => (
              <DownloadImagesMessage
                key='dim'
                onError={onDockerImageDownloadError}
                onSuccess={onImagesDowloadSuccess}
              />
            ),
            barFill: 0.625,
            noSkip: true,
          },
        ]),
      )
    }
    /**
     * @TODO - it's a perfect spot for the splashscreen invoke
     */
  }

  useEffect(() => {
    checkDocker()
  }, [])

  const pushMessages = (msgs: TBotMessage[]) => {
    if (!messagesRef.current) {
      return
    }
    const newMsgs = messagesRef.current.concat(msgs)
    setMessages(newMsgs)
  }

  /** MOCK FOR DOCKER IMAGE DOWNLOAD */
  const onImagesDowloadSuccess = () => {
    pushMessages([
      {
        content: <BlockchainSyncStep pushMessages={pushMessages} />,
        barFill: 0.875,
        wait: 500,
        noSkip: true,
      },
    ])
  }

  const onDockerInstallDone = () => {
    pushMessages(
      OnboardingMessagesDockerInstallAfter.concat([
        {
          content: () => (
            <DownloadImagesMessage
              key='dim'
              onError={onDockerImageDownloadError}
              onSuccess={onImagesDowloadSuccess}
            />
          ),
          barFill: 0.625,
          noSkip: true,
        },
      ]),
    )
  }

  const onDockerImageDownloadError = (
    type: 'no_space_error' | 'server_error',
  ) => {
    pushMessages([
      {
        content: () => (
          <DownloadImagesErrorMessage
            key={`dim-${messages.length}`}
            errorType={type}
            onError={onDockerImageDownloadError}
            onSuccess={onImagesDowloadSuccess}
          />
        ),
        barFill: 0.625,
        noSkip: true,
        wait: 100,
      },
    ])
  }
  /** END OF MOCK FOR DOCKER IMAGE DOWNLOAD */

  /** IS DOCKER INSTALLED */
  useEffect(() => {
    // Do not push Docker related messages to queue until the intro is done
    if (tBotIndex !== 4 || (dockerInstalled && lastOnboardingCheckpoint)) {
      return
    }

    if (dockerInstalled === false) {
      pushMessages(OnboardingMessagesDockerInstall(onDockerInstallDone))
    } else if (dockerInstalled === true) {
      pushMessages([
        {
          content: () => (
            <DownloadImagesMessage
              key={`dim-${messages.length}`}
              onError={onDockerImageDownloadError}
              onSuccess={onImagesDowloadSuccess}
            />
          ),
          barFill: 0.625,
          noSkip: true,
        },
      ])
    }
  }, [dockerInstalled, tBotIndex])

  const onMessageRender = (index: number) => {
    setTBotIndex(index)
  }
  /** END OF MOCK FOR DOCKER INSTALLATION */

  const onSkip = () => {
    setCurrent(messages.length)
  }

  return (
    <StyledOnboardingContainer>
      {/**
       * @TODO remove this temporary button after onboarding development is done.
       */}
      <Button
        onClick={() => dispatch(setOnboardingComplete(true))}
        style={{
          position: 'absolute',
          bottom: 40,
          left: 40,
        }}
      >
        EXIT TO HOME
      </Button>
      <TBotPrompt
        open={true}
        messages={messages}
        currentIndex={current}
        closeIcon={false}
        mode='onboarding'
        floating={false}
        onMessageRender={onMessageRender}
        onSkip={onSkip}
      />
    </StyledOnboardingContainer>
  )
}

export default OnboardingContainer
