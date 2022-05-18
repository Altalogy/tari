import { useState } from 'react'

import { useAppSelector, useAppDispatch } from '../../store/hooks'
import {
  selectState,
  selectPending,
  selectRunning,
} from '../../store/baseNode/selectors'
import { actions } from '../../store/baseNode'
import Alert from '../../components/Alert'
import t from '../../locales'

import BaseNode from './BaseNode'

const BaseNodeContainer = () => {
  const [error, setError] = useState('')

  const { network } = useAppSelector(selectState)
  const pending = useAppSelector(selectPending)
  const running = useAppSelector(selectRunning)
  const dispatch = useAppDispatch()

  const startNode = async () => {
    try {
      await dispatch(actions.startNode()).unwrap()
    } catch (e) {
      setError(t.baseNode.errors.start)
    }
  }

  const stopNode = async () => {
    try {
      await dispatch(actions.stopNode()).unwrap()
    } catch (e) {
      setError(t.baseNode.errors.stop)
    }
  }

  return (
    <>
      <BaseNode
        running={running}
        pending={pending}
        startNode={startNode}
        stopNode={stopNode}
        tariNetwork={network}
        setTariNetwork={network => dispatch(actions.setTariNetwork(network))}
      />
      <Alert
        title='Error'
        open={Boolean(error)}
        onClose={() => setError('')}
        content={error}
      />
    </>
  )
}

export default BaseNodeContainer
