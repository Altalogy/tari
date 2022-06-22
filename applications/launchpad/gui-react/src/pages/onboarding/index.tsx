import OnboardingContainer from '../../containers/Onboarding'
import MainLayout from '../../layouts/MainLayout'

/**
 * Onboarding
 */
const Onboarding = () => {
  return (
    <MainLayout
      ChildrenComponent={OnboardingContainer}
      drawerViewWidth='40%'
      titleBarProps={{
        hideSettingsButton: true,
      }}
    />
  )
}

export default Onboarding
