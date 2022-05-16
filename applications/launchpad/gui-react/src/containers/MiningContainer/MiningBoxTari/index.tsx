import { ReactNode } from 'react'

import MiningBox from '../MiningBox'
import WalletPasswordWizard from '../../WalletPasswordWizard'

import SvgTariSignet from '../../../styles/Icons/TariSignet'

import t from '../../../locales'

import { useAppSelector } from '../../../store/hooks'
import {
  selectTariContainers,
  selectTariMiningState,
  selectTariSetupRequired,
} from '../../../store/mining/selectors'
import { TariMiningSetupRequired } from '../../../store/mining/types'
import { MiningBoxStatus } from '../MiningBox/types'

const MiningBoxTari = () => {
  const nodeState = useAppSelector(selectTariMiningState)
  const containersState = useAppSelector(selectTariContainers)
  const tariSetupRequired = useAppSelector(selectTariSetupRequired)

  let boxContent: ReactNode | undefined
  let currentStatus: MiningBoxStatus | undefined

  if (tariSetupRequired === TariMiningSetupRequired.MissingWalletAddress) {
    currentStatus = MiningBoxStatus.SetupRequired
    boxContent = (
      <WalletPasswordWizard submitBtnText={t.mining.setUpTariWalletSubmitBtn} />
    )
  }

  return (
    <MiningBox
      node='tari'
      icons={[<SvgTariSignet key='tari-icon' />]}
      testId='tari-mining-box'
      currentStatus={currentStatus}
      nodeState={nodeState}
      containersState={containersState}
    >
      {boxContent}
    </MiningBox>
  )
}

export default MiningBoxTari
