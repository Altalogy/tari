/* eslint-disable react/jsx-key */
import { useEffect, useRef, useState } from 'react'

import Text from '../../Text'
import t from '../../../locales'
import Button from '../../Button'

import { useAppDispatch } from '../../../store/hooks'
import { setOnboardingComplete } from '../../../store/app'
import { actions as baseNodeActions } from '../../../store/baseNode'
import {
  CtaButtonContainer,
  FlexContent,
  ProgressContainer,
  RemainingTime,
} from './styles'
import ProgressBar from '../../ProgressBar'
import { TBotMessage, TBotMessageHOCProps } from '../../TBot/TBotPrompt/types'
import { useTheme } from 'styled-components'

/**
 * @TODO - how the Blockchain synchronization should to work?
 */

const Progress = ({ progress, time }: { progress: number; time: string }) => {
  const theme = useTheme()

  return (
    <ProgressContainer>
      <Text
        color={theme.accent}
        type='smallMedium'
        style={{
          alignSelf: 'flex-start',
          marginBottom: theme.spacingVertical(0.5),
        }}
      >
        {t.onboarding.lastSteps.blockchainIsSyncing}
      </Text>
      <ProgressBar value={progress} />
      <RemainingTime>
        <Text type='smallMedium'>
          {time} {t.common.adjectives.remaining.toLowerCase()}
        </Text>
      </RemainingTime>
    </ProgressContainer>
  )
}

export const BlockchainSyncStep = ({
  pushMessages,
  updateMessageBoxSize,
}: {
  pushMessages: (msgs: TBotMessage[]) => void
} & TBotMessageHOCProps) => {
  const dispatch = useAppDispatch()

  const contentRef = useRef<HTMLDivElement | null>(null)

  const [error, setError] = useState(false)
  const [syncStarted, setSyncStarted] = useState(false)
  const [syncFinished, setSyncFinished] = useState(false)
  const [progress, setProgress] = useState(0)
  const [remainingTime, setRemainingTime] = useState('55 min')

  const startSync = async () => {
    setSyncStarted(true)
    pushMessages([
      {
        content: <Text>{t.onboarding.lastSteps.message2}</Text>,
        barFill: 0.875,
        noSkip: true,
      },
    ])
    try {
      await dispatch(baseNodeActions.startNode()).unwrap()
    } catch (e) {
      setError(true)
    }
  }

  useEffect(() => {
    if (error) {
      pushMessages([
        {
          content: (
            <>
              <Text>{t.onboarding.lastSteps.syncError}</Text>
              <CtaButtonContainer>
                <Button
                  variant='secondary'
                  onClick={() => dispatch(setOnboardingComplete(true))}
                >
                  {t.common.verbs.continue}
                </Button>
              </CtaButtonContainer>
            </>
          ),
          barFill: 0.875,
          noSkip: true,
          wait: 200,
        },
      ])
    }
  }, [error])

  useEffect(() => {
    if (syncStarted && updateMessageBoxSize && contentRef.current) {
      updateMessageBoxSize()
    }
  }, [syncStarted])

  useEffect(() => {
    if (syncFinished) {
      // dispatch(setOnboardingComplete(true))
    }
  }, [syncFinished])

  /** MOCK WAITING FOR BASE NODE EVENT ABOUT SYNC PROGRESS */
  const intervalRef = useRef<ReturnType<typeof setInterval> | undefined>()
  const [intervalStarted, setIntervalStarted] = useState(false)
  useEffect(() => {
    if (syncStarted && !intervalStarted) {
      let counter = 1
      intervalRef.current = setInterval(async () => {
        setProgress(counter * 10)
        setRemainingTime(`${55 - counter * 5} min`)
        if (counter > 6) {
          setError(true)
        }
        if (counter > 10) {
          setSyncFinished(true)
          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
          clearInterval(intervalRef.current!)
        }
        counter++
      }, 2000)
      setIntervalStarted(true)
    }

    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    return () => clearInterval(intervalRef.current!)
  }, [syncStarted])
  /** END OF MOCK WAITING FOR BASE NODE EVENT ABOUT SYNC PROGRESS */

  return (
    <FlexContent ref={contentRef}>
      <Text as='span' type='defaultHeavy'>
        {t.onboarding.lastSteps.message1} ✨💪
      </Text>

      {!syncStarted && (
        <CtaButtonContainer>
          <Button variant='primary' onClick={startSync}>
            {t.onboarding.dockerInstall.startSyncBtn}
          </Button>
        </CtaButtonContainer>
      )}

      {syncStarted && (
        <>
          <Progress progress={progress} time={remainingTime} />
          <CtaButtonContainer style={{ justifyContent: 'center' }}>
            <Button
              variant='secondary'
              onClick={() => dispatch(setOnboardingComplete(true))}
            >
              {t.common.verbs.cancel}
            </Button>
          </CtaButtonContainer>
        </>
      )}
    </FlexContent>
  )
}
