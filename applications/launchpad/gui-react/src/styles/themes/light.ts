import styles from '../styles'

const lightTheme = {
  primary: styles.colors.dark.primary,
  secondary: styles.colors.dark.secondary,
  tertiary: styles.colors.dark.tertiary,
  background: styles.colors.light.primary,
  backgroundSecondary: styles.colors.light.background,
  backgroundImage: styles.colors.light.backgroundImage,
  accent: styles.colors.tari.purple,
  accentDark: styles.colors.tari.purpleDark,
  accentMonero: styles.colors.secondary.warningDark,
  accentMerged: styles.colors.merged.dark,
  disabledText: styles.colors.dark.placeholder,
  tariGradient: styles.gradients.tari,
  mergedGradient: styles.gradients.merged,
  warningGradient: styles.gradients.warning,
  borderColor: styles.colors.dark.borders,
  borderColorLight: styles.colors.secondary.borderLight,
  actionBackground: styles.colors.secondary.actionBackground,
  resetBackground: styles.colors.light.overlay,
  resetBackgroundHover: styles.colors.light.overlayDark,
  moneroDark: styles.colors.monero.dark,
  shadow40: '0 0 40px #00000011',
  shadow24: '0 0 24px #00000006',

  titleBar: styles.colors.light.background,
  controlBackground: 'transparent',
  info: styles.colors.secondary.info,
  infoText: styles.colors.secondary.infoText,
  on: styles.colors.secondary.on,
  onText: styles.colors.secondary.onText,
  onTextLight: styles.colors.secondary.onTextLight,
  warning: styles.colors.secondary.warning,
  warningText: styles.colors.secondary.warningText,
  warningDark: styles.colors.secondary.warningDark,
  success: styles.colors.secondary.onTextLight,
  error: styles.colors.secondary.error,
  expert: 'rgba(147, 48, 255, 0.05)',
  expertText: styles.gradients.tari,
  lightTag: styles.colors.light.backgroundImage,
  lightTagText: styles.colors.dark.secondary,
  placeholderText: styles.colors.dark.placeholder,
  textSecondary: styles.colors.light.textSecondary,

  inverted: {
    primary: styles.colors.light.primary,
    secondary: styles.colors.light.textSecondary,
    tertiary: styles.colors.dark.tertiary,
    background: styles.colors.darkMode.modalBackgroundSecondary,
    backgroundSecondary: styles.colors.darkMode.modalBackground,
    backgroundImage: styles.colors.light.backgroundImage,
    accent: styles.colors.tari.purple,
    accentSecondary: styles.colors.secondary.onTextLight,
    accentDark: styles.colors.tari.purpleDark,
    accentMonero: styles.colors.secondary.warningDark,
    accentMerged: styles.colors.merged.dark,
    disabledText: styles.colors.dark.placeholder,
    tariGradient: styles.gradients.tari,
    mergedGradient: styles.gradients.merged,
    warningGradient: styles.gradients.warning,
    info: styles.colors.secondary.info,
    infoText: styles.colors.secondary.infoText,
    on: styles.colors.secondary.on,
    onText: styles.colors.secondary.onText,
    onTextLight: styles.colors.secondary.onTextLight,
    warning: styles.colors.secondary.warning,
    warningText: styles.colors.secondary.warningText,
    warningDark: styles.colors.secondary.warningDark,
    success: styles.colors.secondary.onTextLight,
    error: styles.colors.secondary.error,
    expert: 'rgba(147, 48, 255, 0.05)',
    expertText: styles.gradients.tari,
    lightTag: styles.colors.light.backgroundImage,
    lightTagText: styles.colors.dark.secondary,
    borderColor: styles.colors.secondary.borderLight,
    borderColorLight: styles.colors.secondary.borderLight,
    actionBackground: styles.colors.secondary.actionBackground,
    resetBackground: styles.colors.light.overlay,
    resetBackgroundHover: styles.colors.light.overlayDark,
    moneroDark: styles.colors.monero.dark,
    controlBackground: 'rgba(255,255,255,.2)',
  },
}

export default lightTheme
