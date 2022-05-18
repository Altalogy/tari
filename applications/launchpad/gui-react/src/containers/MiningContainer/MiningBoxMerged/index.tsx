import { ReactNode, useEffect, useState } from 'react'
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
import { Container } from '../../../store/containers/types'

const MiningBoxMerged = () => {
  const theme = useTheme()
  const dispatch = useAppDispatch()

  let boxContent: ReactNode | undefined
  let currentStatus: MiningBoxStatus | undefined

  const nodeState = useAppSelector(selectMergedMiningState)
  const containersState = useAppSelector(selectMergedContainers)
  const mergedSetupRequired = useAppSelector(selectMergedSetupRequired)

  // Stop only Merged related containers on pause/stop action
  const [containersToStopOnPause, setContainersToStopOnPause] = useState<
    { id: string; type: Container }[]
  >([])

  useEffect(() => {
    if (
      (!containersState ||
        !containersState.dependsOn ||
        containersState.dependsOn.length === 0) &&
      containersToStopOnPause.length > 0
    ) {
      setContainersToStopOnPause([])
    } else if (containersState && containersState.dependsOn?.length > 0) {
      const cs = containersState.dependsOn.filter(
        c =>
          [Container.XMrig, Container.MMProxy, Container.Monerod].includes(
            c.type,
          ) && c.id,
      )

      setContainersToStopOnPause(
        cs.map(c => ({
          id: c.id,
          type: c.type,
        })),
      )
    }
  }, [containersState])

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
      containersToStopOnPause={containersToStopOnPause}
    >
      {boxContent}
    </MiningBox>
  )
}

export default MiningBoxMerged
