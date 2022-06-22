import { TitleBarProps } from '../../components/TitleBar/types'
import DashboardContainer from '../../containers/Dashboard/DashboardContainer'
import OnboardingContainer from '../../containers/Onboarding'

export interface MainLayoutProps {
  drawerViewWidth?: string
  ChildrenComponent: typeof DashboardContainer | typeof OnboardingContainer
  titleBarProps?: TitleBarProps
}
