import { ReactNode } from 'react'
import { useTheme } from 'styled-components'
import Button from '../../../components/Button'
import { useAppDispatch, useAppSelector } from '../../../store/hooks'
import {
  selectMergedContainers,
  selectMergedMiningState,
  selectMergedSetupRequired,
} from '../../../store/mining/selectors'
import { MergedMiningSetupRequired } from '../../../store/mining/types'
import { actions as settingsActions } from '../../../store/settings'
import SvgMoneroSignet from '../../../styles/Icons/MoneroSignet'
import SvgTariSignet from '../../../styles/Icons/TariSignet'
import MiningBox from '../MiningBox'
import { MiningBoxStatus } from '../MiningBox/types'

import t from '../../../locales'

const MiningBoxMerged = () => {
  const theme = useTheme()
  const dispatch = useAppDispatch()

  let boxContent: ReactNode | undefined
  let currentStatus: MiningBoxStatus | undefined

  const nodeState = useAppSelector(selectMergedMiningState)
  const containersState = useAppSelector(selectMergedContainers)
  const mergedSetupRequired = useAppSelector(selectMergedSetupRequired)

  const statuses = {
    [MiningBoxStatus.Running]: {
      boxStyle: {
        background: theme.mergedGradient,
      },
      icon: {
        color: theme.accentMerged,
      },
    },
  }

  if (mergedSetupRequired) {
    currentStatus = MiningBoxStatus.SetupRequired
    boxContent = (
      <div>
        <p>
          If you want to start merged mining you need to set up your Monero
          address first.
        </p>
        <Button
          variant='primary'
          onClick={() => dispatch(settingsActions.open({}))}
          disabled={
            mergedSetupRequired ===
            MergedMiningSetupRequired.MissingWalletAddress
          }
        >
          {t.mining.actions.setupAndStartMining}
        </Button>
      </div>
    )
  }

  return (
    <MiningBox
      node='merged'
      icons={[
        <SvgMoneroSignet key='monero-icon' />,
        <SvgTariSignet key='tari-icon' />,
      ]}
      testId='merged-mining-box'
      statuses={statuses}
      currentStatus={currentStatus}
      nodeState={nodeState}
      containersState={containersState}
    >
      {boxContent}
    </MiningBox>
  )
}

export default MiningBoxMerged
