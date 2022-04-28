import Button from '../../../components/Button'
import NodeBox from '../../../components/NodeBox'

import { useAppDispatch, useAppSelector } from '../../../store/hooks'

import { actions as miningActions } from '../../../store/mining'
import { selectMiningNode } from '../../../store/mining/selectors'
import MiningBox from '../MiningBox'

const MiningBoxMerged = () => {
  // const dispatch = useAppDispatch()
  // const miningState = useAppSelector(state => selectMiningNode(state, 'merged'))
  console.log('MERGED ----')

  return <MiningBox node='merged' />
}

export default MiningBoxMerged
