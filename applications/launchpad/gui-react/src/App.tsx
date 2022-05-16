import styled, { ThemeProvider } from 'styled-components'

import { useAppSelector, useAppDispatch } from './store/hooks'
import { selectThemeConfig } from './store/app/selectors'

import { useSystemEvents } from './useSystemEvents'
import HomePage from './pages/home'
import { loadDefaultServiceSettings } from './store/settings/thunks'
import './styles/App.css'
import { useEffect } from 'react'

import { actions as miningActions } from './store/mining'

const AppContainer = styled.div`
  background: ${({ theme }) => theme.background};
  display: flex;
  flex: 1;
  overflow: hidden;
  border-radius: 10;
`
const App = () => {
  const themeConfig = useAppSelector(selectThemeConfig)
  const dispatch = useAppDispatch()
  dispatch(loadDefaultServiceSettings())

  /**
   * @TODO - remove after mining dev
   */
  useEffect(() => {
    const timer = setInterval(
      () => dispatch(miningActions.addAmount({ amount: '1000', node: 'tari' })),
      10e3,
    )
    return () => clearInterval(timer)
  }, [])

  /**
   * @TODO - remove after mining dev
   */
  useEffect(() => {
    const timer = setInterval(
      () =>
        dispatch(miningActions.addAmount({ amount: '500', node: 'merged' })),
      35e3,
    )
    return () => clearInterval(timer)
  }, [])

  useSystemEvents({ dispatch })

  return (
    <ThemeProvider theme={themeConfig}>
      <AppContainer>
        <HomePage />
      </AppContainer>
    </ThemeProvider>
  )
}

export default App
