import { useEffect, useState, useMemo } from 'react'
import styled, { ThemeProvider } from 'styled-components'
import 'uplot/dist/uPlot.min.css'

import { useAppSelector, useAppDispatch } from './store/hooks'
import useTransactionsRepository from './persistence/transactionsRepository'
import getStatsRepository from './persistence/statsRepository'
import { init } from './store/app'
import {
  selectOnboardingComplete,
  selectThemeConfig,
} from './store/app/selectors'
import { useSystemEvents } from './useSystemEvents'
import { useWalletEvents } from './useWalletEvents'
import { useDockerEvents } from './useDockerEvents'
import HomePage from './pages/home'
import './styles/App.css'

import useMiningScheduling from './useMiningScheduling'
import TBotContainer from './containers/TBotContainer'
import MiningNotifications from './containers/MiningNotifications'
import Onboarding from './pages/onboarding'
import { WalletPasswordPrompt } from './useWithWalletPassword'

const AppContainer = styled.div`
  background: ${({ theme }) => theme.background};
  display: flex;
  flex: 1;
  overflow: hidden;
  border-radius: 10;
`
const OnboardedAppContainer = ({
  children,
}: {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  children: any
}) => {
  const transactionsRepository = useTransactionsRepository()
  const dispatch = useAppDispatch()
  const statsRepository = useMemo(getStatsRepository, [])

  useSystemEvents({ dispatch })
  useWalletEvents({ dispatch, transactionsRepository })
  useMiningScheduling()
  useEffect(() => {
    statsRepository.removeOld()
  }, [])

  return children
}

const App = () => {
  const dispatch = useAppDispatch()
  const themeConfig = useAppSelector(selectThemeConfig)
  const onboardingComplete = useAppSelector(selectOnboardingComplete)

  const [initialized, setInitialized] = useState(false)

  useEffect(() => {
    const callInitActionInStore = async () => {
      try {
        await dispatch(init()).unwrap()
        setInitialized(true)
      } catch (_) {
        // TODO handle error
      }
    }

    callInitActionInStore()
  }, [])

  useSystemEvents({ dispatch })
  useDockerEvents({ dispatch })

  // TODO could return loader instead of null if not initialized
  return (
    <ThemeProvider theme={themeConfig}>
      <AppContainer>
        {!onboardingComplete ? (
          initialized ? (
            <Onboarding />
          ) : null
        ) : initialized ? (
          <WalletPasswordPrompt>
            <OnboardedAppContainer>
              <HomePage />
              <TBotContainer />
              <MiningNotifications />
            </OnboardedAppContainer>
          </WalletPasswordPrompt>
        ) : null}
      </AppContainer>
    </ThemeProvider>
  )
}

export default App
