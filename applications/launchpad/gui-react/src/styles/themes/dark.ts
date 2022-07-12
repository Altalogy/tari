import styles from '../styles'

const darkTheme = {
  primary: styles.colors.light.primary,
  secondary: styles.colors.dark.secondary,
  tertiary: styles.colors.dark.tertiary,
  background: styles.colors.darkMode.modalBackgroundSecondary,
  backgroundSecondary: styles.colors.darkMode.modalBackground,
  backgroundImage: styles.colors.light.backgroundImage,
  accent: styles.colors.tari.purple,
  accentDark: styles.colors.tari.purpleDark,
  accentMerged: styles.colors.darkMode.darkLogoCard,
  disabledText: styles.colors.dark.placeholder,
  tariGradient: styles.gradients.tariDark,
  tariTextGradient: styles.gradients.tariText,
  mergedGradient: styles.gradients.mergedDark,
  warningGradient: styles.gradients.warning,
  greenMedium: styles.colors.secondary.greenMedium,
  borderColor: styles.colors.darkMode.modalBackground,

  titleBar: styles.colors.dark.primary,
  borderColorLight: styles.colors.secondary.borderLight,
  resetBackground: styles.colors.light.overlay,
  resetBackgroundHover: styles.colors.light.overlayDark,
  moneroDark: styles.colors.monero.dark,
  controlBackground: styles.colors.darkMode.input,
  infoTag: styles.colors.darkMode.tags,
  infoText: styles.colors.secondary.infoText,
  on: styles.colors.secondary.on,
  onText: styles.colors.secondary.onText,
  onTextLight: styles.colors.secondary.onTextLight,
  warning: styles.colors.secondary.warning,
  warningTag: styles.colors.darkMode.tags,
  warningText: styles.colors.secondary.warningText,
  warningDark: styles.colors.secondary.warningDark,
  success: styles.colors.secondary.onTextLight,
  error: styles.colors.secondary.error,
  expert: 'rgba(255, 255, 255, 0.06)',
  expertText: styles.gradients.tari,
  expertSecText: 'rgba(255, 255, 255, 0.32)',
  lightTag: styles.colors.darkMode.tags,
  lightTagText: styles.colors.dark.secondary,
  placeholderText: styles.colors.dark.placeholder,
  textSecondary: styles.colors.light.textSecondary,
  mergedAccent: styles.colors.merged.dark,
  helpTipText: styles.colors.light.textSecondary,
  runningTagBackground: styles.colors.darkMode.tags,
  runningTagText: styles.colors.secondary.onTextLight,
  dashboardRunningTagText: styles.colors.light.primary,
  dashboardRunningTagBackground: styles.colors.darkMode.modalBackground,
  switchBorder: styles.colors.darkMode.input,
  switchCircle: styles.colors.dark.secondary,
  switchController: styles.colors.light.overlay,
  nodeBackground: styles.colors.darkMode.modalBackground,
  nodeLightIcon: styles.colors.darkMode.darkLogoCard,
  nodeSubHeading: styles.colors.dark.secondary,
  nodeWarningText: styles.colors.light.textSecondary,
  calloutBackground: styles.colors.darkMode.tags,
  inputPlaceholder: styles.colors.dark.secondary,
  disabledPrimaryButton: styles.colors.darkMode.borders,
  disabledPrimaryButtonText: styles.colors.darkMode.disabledText,
  baseNodeGradientStart: styles.colors.darkMode.baseNodeStart,
  baseNodeGradientEnd: styles.colors.darkMode.baseNodeEnd,
  baseNodeRunningLabel: styles.colors.light.textSecondary,
  baseNodeRunningTagBackground: styles.colors.darkMode.tags,
  baseNodeRunningTagText: styles.colors.secondary.on,
  selectBorderColor: styles.colors.darkMode.borders,
  selectOptionHover: styles.colors.darkMode.input,
  walletSetupBorderColor: styles.colors.darkMode.borders,
  walletCopyBoxBorder: 'transparent',
  balanceBoxBorder: styles.colors.darkMode.borders,
  walletBottomBox: styles.colors.darkMode.tags,
  modalBackdrop: styles.colors.darkMode.input,
  settingsMenuItem: styles.colors.dark.secondary,
  settingsMenuItemActive: styles.colors.darkMode.dashboard,
  settingsCopyBoxBackground: styles.colors.darkMode.modalBackground,
  scrollBarTrack: styles.colors.darkMode.modalBackground,
  scrollBarThumb: styles.colors.darkMode.borders,
  scrollBarHover: styles.colors.darkMode.disabledText,
  calendarText: styles.colors.light.graySecondary,
  calendarTextSecondary: styles.colors.light.graySecondary,
  calendarNumber: styles.colors.dark.borders,

  inverted: {
    primary: styles.colors.light.primary,
    secondary: styles.colors.dark.secondary,
    tertiary: styles.colors.dark.tertiary,
    background: styles.colors.darkMode.modalBackgroundSecondary,
    backgroundSecondary: styles.colors.darkMode.modalBackground,
    backgroundImage: styles.colors.light.backgroundImage,
    accent: styles.colors.tari.purple,
    accentSecondary: styles.colors.secondary.onTextLight,
    accentDark: styles.colors.tari.purpleDark,
    accentMerged: styles.colors.darkMode.darkLogoCard,
    disabledText: styles.colors.dark.placeholder,
    tariGradient: styles.gradients.tariDark,
    tariTextGradient: styles.gradients.tariText,
    mergedGradient: styles.gradients.mergedDark,
    warningGradient: styles.gradients.warning,
    greenMedium: styles.colors.secondary.greenMedium,
    infoTag: styles.colors.secondary.info,
    infoText: styles.colors.secondary.infoText,
    on: styles.colors.secondary.on,
    onText: styles.colors.secondary.onText,
    onTextLight: styles.colors.secondary.onTextLight,
    warning: styles.colors.secondary.warning,
    warningText: styles.colors.secondary.warningText,
    warningDark: styles.colors.secondary.warningDark,
    success: styles.colors.secondary.onTextLight,
    error: styles.colors.secondary.error,
    expert: 'rgba(255, 255, 255, 0.06)',
    expertText: styles.gradients.tari,
    expertSecText: 'rgba(255, 255, 255, 0.32)',
    lightTag: styles.colors.light.backgroundImage,
    lightTagText: styles.colors.dark.secondary,
    placeholderText: styles.colors.dark.placeholder,
    borderColor: styles.colors.light.backgroundImage,
    borderColorLight: styles.colors.secondary.borderLight,
    resetBackground: styles.colors.light.overlay,
    resetBackgroundHover: styles.colors.light.overlayDark,
    moneroDark: styles.colors.monero.dark,
    controlBackground: 'transparent',
    helpTipText: styles.colors.light.textSecondary,
    runningTagBackground: styles.colors.darkMode.tags,
    runningTagText: styles.colors.secondary.onTextLight,
    dashboardRunningTagText: styles.colors.light.primary,
    dashboardRunningTagBackground: styles.colors.darkMode.modalBackground,
    switchBorder: styles.colors.darkMode.input,
    switchCircle: styles.colors.dark.secondary,
    switchController: styles.colors.light.overlay,
    nodeBackground: styles.colors.darkMode.modalBackground,
    nodeLightIcon: styles.colors.darkMode.darkLogoCard,
    nodeSubHeading: styles.colors.dark.secondary,
    nodeWarningText: styles.colors.light.textSecondary,
    calloutBackground: styles.colors.darkMode.tags,
    inputPlaceholder: styles.colors.dark.secondary,
    disabledPrimaryButton: styles.colors.darkMode.borders,
    disabledPrimaryButtonText: styles.colors.darkMode.disabledText,
    baseNodeGradientStart: styles.colors.darkMode.baseNodeStart,
    baseNodeGradientEnd: styles.colors.darkMode.baseNodeEnd,
    baseNodeRunningLabel: styles.colors.light.textSecondary,
    baseNodeRunningTagBackground: styles.colors.darkMode.tags,
    baseNodeRunningTagText: styles.colors.secondary.on,
    selectBorderColor: styles.colors.darkMode.borders,
    selectOptionHover: styles.colors.darkMode.input,
    walletSetupBorderColor: 'transparent',
    walletCopyBoxBorder: 'transparent',
    balanceBoxBorder: styles.colors.darkMode.borders,
    walletBottomBox: styles.colors.darkMode.tags,
    modalBackdrop: styles.colors.darkMode.input,
    settingsMenuItemActive: styles.colors.darkMode.dashboard,
    settingsCopyBoxBackground: styles.colors.darkMode.modalBackground,
    scrollBarTrack: styles.colors.darkMode.modalBackground,
    calendarText: styles.colors.light.graySecondary,
    calendarTextSecondary: styles.colors.light.graySecondary,
    calendarNumber: styles.colors.dark.borders,
  },
}

export default darkTheme
