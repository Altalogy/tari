import { useSelector } from 'react-redux'
import { ThemeProvider } from 'styled-components'

import { selectThemeConfig } from './store/app/selectors'

import HomePage from './pages/home'

import './styles/App.css'

const App = () => {
  const themeConfig = useSelector(selectThemeConfig)

  return (
    <ThemeProvider theme={themeConfig}>
      <HomePage />
    </ThemeProvider>
  )
}

export default App
