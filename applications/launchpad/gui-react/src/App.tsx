import { useEffect, useState } from 'react'
import styled, { ThemeProvider } from 'styled-components'

import { useAppSelector, useAppDispatch } from './store/hooks'
import useTransactionsRepository from './persistence/transactionsRepository'
import { actions as dockerImagesActions } from './store/dockerImages'
import {
  selectOnboardingComplete,
  selectThemeConfig,
} from './store/app/selectors'
import { useSystemEvents } from './useSystemEvents'
import { useWalletEvents } from './useWalletEvents'
import { useDockerEvents } from './useDockerEvents'
import HomePage from './pages/home'
import { loadDefaultServiceSettings } from './store/settings/thunks'
import './styles/App.css'

import useMiningScheduling from './useMiningScheduling'
import TBotContainer from './containers/TBotContainer'
import MiningNotifications from './containers/MiningNotifications'
import Onboarding from './pages/onboarding'
import OnboardingContainer from './containers/Onboarding'
import React from 'react'

class ErrorBoundary extends React.Component<{ children: any }> {
  constructor(props: any) {
    super(props)
    this.state = { hasError: '' }
  }

  static getDerivedStateFromError(error: any) {
    // Zaktualizuj stan, aby następny render pokazał zastępcze UI.
    return { hasError: error.toString() }
  }

  // componentDidCatch(error: any, errorInfo: any) {
  //   return <p>Error</p>
  // }

  render() {
    if ((this.state as { hasError: string }).hasError) {
      // Możesz wyrenderować dowolny interfejs zastępczy.
      return (
        <h1>
          Something went wrong. {(this.state as { hasError: string }).hasError}
        </h1>
      )
    }

    return this.props.children
  }
}

const AppContainer = styled.div`
  background: ${({ theme }) => theme.background};
  display: flex;
  flex: 1;
  overflow: hidden;
  border-radius: 10;
`
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const OnboardedAppContainer = ({ children }: { children: any }) => {
  const [initialized, setInitialized] = useState(false)
  const transactionsRepository = useTransactionsRepository()
  const dispatch = useAppDispatch()

  useEffect(() => {
    const init = async () => {
      await dispatch(loadDefaultServiceSettings()).unwrap()
      await dispatch(dockerImagesActions.getDockerImageList()).unwrap()
      setInitialized(true)
    }

    init()
  }, [])

  useSystemEvents({ dispatch })
  useWalletEvents({ dispatch, transactionsRepository })
  useDockerEvents({ dispatch })
  useMiningScheduling()

  if (!initialized) {
    return null
  }

  return children
}

const App = () => {
  const themeConfig = useAppSelector(selectThemeConfig)
  const onboardingComplete = useAppSelector(selectOnboardingComplete)

  return (
    <ErrorBoundary>
      <ThemeProvider theme={themeConfig}>
        <AppContainer>
          {!onboardingComplete ? (
            <OnboardingContainer />
          ) : (
            <OnboardedAppContainer>
              <HomePage />
              <TBotContainer />
              <MiningNotifications />
            </OnboardedAppContainer>
          )}
        </AppContainer>
      </ThemeProvider>
    </ErrorBoundary>
  )
}

export default App
