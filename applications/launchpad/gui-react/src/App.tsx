import { useState, useEffect } from 'react'
import { useSelector } from 'react-redux'
import styled, { ThemeProvider } from 'styled-components'

import { selectThemeConfig } from './store/app/selectors'

import HomePage from './pages/home'

import './styles/App.css'

const AppContainer = styled.div`
  background: ${({ theme }) => theme.background};
  display: flex;
  flex: 1;
  overflow: hidden;
  border-radius: 10;
`

const App = () => {
  const themeConfig = useSelector(selectThemeConfig)
  const [counter] = useState(() => Number(localStorage.getItem('tari.counter')))

  useEffect(() => {
    localStorage.setItem('tari.counter', (counter + 1).toString())
  }, [])

  return (
    <ThemeProvider theme={themeConfig}>
      <AppContainer>
        <HomePage />
      </AppContainer>
    </ThemeProvider>
  )
}

export default App
