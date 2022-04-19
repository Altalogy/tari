import darkTheme from './dark'
import lightTheme from './light'

export type ThemeType = 'light' | 'dark'

const themes = {
  light: lightTheme,
  dark: darkTheme,
}

export default themes