import styles from '../styles'

const darkTheme = {
  primary: styles.colors.light.primary,
  secondary: styles.colors.dark.secondary,
  background: styles.colors.dark.primary,
  backgroundSecondary: styles.colors.darkMode.modalBackground,
  backgroundImage: styles.colors.light.backgroundImage,
  accent: styles.colors.tari.purple,
  accentDark: styles.colors.tari.purpleDark,
  disabledText: styles.colors.dark.placeholder,
  tariGradient: styles.gradients.tari,
  
  inverted: {
    primary: styles.colors.light.primary,
    secondary: styles.colors.dark.secondary,
    background: styles.colors.light.primary,
    backgroundSecondary: styles.colors.darkMode.modalBackground,
    backgroundImage: styles.colors.light.backgroundImage,
    accent: styles.colors.tari.purple,
    accentDark: styles.colors.tari.purpleDark,
    disabledText: styles.colors.dark.placeholder,
    tariGradient: styles.gradients.tari,
  },
}

export default darkTheme