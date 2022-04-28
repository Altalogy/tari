import Button from '../../../components/Button'
import NodeBox from '../../../components/NodeBox'

import { useAppDispatch, useAppSelector } from '../../../store/hooks'

import { actions as miningActions } from '../../../store/mining'
import { selectMiningNode } from '../../../store/mining/selectors'
import { MiningNodeState } from '../../../store/mining/types'
import { selectState as selectWalletState } from '../../../store/wallet/selectors'
import MiningBox from '../MiningBox'

const MiningBoxTari = () => {
  // const dispatch = useAppDispatch()
  const miningState = useAppSelector(state => selectMiningNode(state, 'tari'))
  const walletState = useAppSelector(selectWalletState)
  console.log('TARI ----')

  /* 3-4 states here
    1. Disabled - missing wallet (or wallet has not been configured) - this is pretty much custom, sometimes it depends on many reasons
    2. Inactive 1 - nothing mined 
    3. Inactive 2 - paused - running false, but something has been already mined
    4. Active - running
  */

  const defaultProps = {
    title: 'Tari mining',
    chains: ['XTR'],
    style: {
      box: {
        background: '#fff',
        color: '#222',
      },
    },
  }

  const statusesConfig = {
    configure: {
      tag: {
        text: 'Start here',
        type: 'default',
      },
    },
    paused: {},
    running: {
      style: {
        box: {
          background: 'red',
          color: '#fff',
        },
      },
    },
  }

  const evaluateStatus = () => {
    if (walletState.address && walletState.address.length > 1) {
      return 'configure'
    }

    if (miningState.running) {
      return 'running'
    }

    return 'paused'
  }

  return <MiningBox node='tari' />
}

export default MiningBoxTari
