import { useSelector } from 'react-redux'
import { CSSProperties } from 'styled-components'
import { SpringValue } from 'react-spring'
import {
  isPermissionGranted,
  requestPermission,
  sendNotification,
} from '@tauri-apps/api/notification'

import { DashboardContent, DashboardLayout } from './styles'

import MiningContainer from '../../MiningContainer'
import BaseNodeContainer from '../../BaseNodeContainer'
import WalletContainer from '../../WalletContainer'

import DashboardTabs from './components/DashboardTabs'
import Footer from '../../../components/Footer'

import { selectView } from '../../../store/app/selectors'

import TBotTest from '../../../assets/images/test_tbot.png'
import TBotTestJpg from '../../../assets/images/test_tbot.jpg'

/**
 * Dashboard view containing three main tabs: Mining, Wallet and BaseNode
 */
const DashboardContainer = ({
  style,
}: {
  style?:
    | CSSProperties
    | Record<string, SpringValue<number>>
    | Record<string, SpringValue<string>>
}) => {
  const currentPage = useSelector(selectView)

  const renderPage = () => {
    switch (currentPage) {
      case 'MINING':
        return <MiningContainer />
      case 'BASE_NODE':
        return <BaseNodeContainer />
      case 'WALLET':
        return <WalletContainer />
      default:
        return null
    }
  }

  const notification = async () => {
    const notify = () =>
      sendNotification({
        title: 'Fantaritastic',
        // eslint-disable-next-line quotes
        body: "You've just mined a Tari block",
        icon: '/home/tarnas/projects/altalogy/tari/applications/launchpad/gui-react/src/assets/images/test_tbot.png',
      })

    if (await isPermissionGranted()) {
      notify()
      return
    }

    const perm = await requestPermission()
    if (perm === 'granted') {
      notify()
    }
  }

  return (
    <DashboardLayout style={style}>
      <button onClick={notification}>test notification</button>
      <DashboardContent>
        <DashboardTabs />
        {renderPage()}
      </DashboardContent>

      <Footer />
    </DashboardLayout>
  )
}

export default DashboardContainer
