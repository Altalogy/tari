import themes, { ThemeType } from '../styles/themes'

class ThemeUtils {
  /**
   * Get the configuration of styles for a given theme.
   * @param {ThemeType} name - the name of the theme, ie. 'light', 'dark'
   */
  static getThemeConfig = (name?: ThemeType) => {
    if (!name) {
      return themes.light
    }

    const themeConfig = themes[name]
    return themeConfig || themes.light
  }
}

export default ThemeUtils