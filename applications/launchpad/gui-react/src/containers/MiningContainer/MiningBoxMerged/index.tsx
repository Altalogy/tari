import { ReactNode, useEffect, useState } from 'react'
import { useTheme } from 'styled-components'
import { useAppSelector } from '../../../store/hooks'
import {
  selectMergedContainers,
  selectMergedMiningState,
  selectMergedSetupRequired,
} from '../../../store/mining/selectors'
import SvgMoneroSignet from '../../../styles/Icons/MoneroSignet'
import SvgTariSignet from '../../../styles/Icons/TariSignet'
import MiningBox from '../MiningBox'
import { MiningBoxStatus } from '../MiningBox/types'

import { Container } from '../../../store/containers/types'

import t from '../../../locales'

// import SetupMerged from './SetupMerged'
import SetupMergedWithForm from './SetupMergedWithForm'
import {
  BestChoiceTagIcon,
  BestChoiceTagText,
  StyledBestChoiceTag,
} from './styles'

const BestChoiceTag = () => {
  return (
    <StyledBestChoiceTag>
      <BestChoiceTagText>{t.common.phrases.bestChoice} </BestChoiceTagText>
      <BestChoiceTagIcon>💪</BestChoiceTagIcon>
    </StyledBestChoiceTag>
  )
}

const MiningBoxMerged = () => {
  const theme = useTheme()

  const [bestChoiceTag, setBestChoiceTag] = useState(false)

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
    [MiningBoxStatus.SetupRequired]: {
      tag: {
        text: bestChoiceTag ? <BestChoiceTag /> : t.common.phrases.readyToSet,
      },
    },
    [MiningBoxStatus.PausedNoSession]: {
      tag: {
        text: t.common.phrases.readyToGo,
      },
    },
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
    /**
     * @TODO - switch between the following when onboarding is added
     */
    // boxContent = <SetupMerged mergedSetupRequired={mergedSetupRequired} />
    boxContent = (
      <SetupMergedWithForm
        mergedSetupRequired={mergedSetupRequired}
        changeTag={() => setBestChoiceTag(true)}
      />
    )
  }

  return (
    <MiningBox
      node='merged'
      icons={[
        { coin: 'xtr', component: <SvgMoneroSignet key='monero-icon' /> },
        { coin: 'xmr', component: <SvgTariSignet key='tari-icon' /> },
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
