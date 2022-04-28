import NodeBox from '../../../components/NodeBox'
import Text from '../../../components/Text'
import { TagType } from '../../../components/Tag/types'
import { useAppDispatch, useAppSelector } from '../../../store/hooks'
import { selectMiningNode } from '../../../store/mining/selectors'
import { actions } from '../../../store/mining'
import {
  MiningNodesStatus,
  MiningNodeStates,
} from '../../../store/mining/types'

import { MiningBoxProps } from './types'

interface Config {
  tag?: {
    text: string
    type?: TagType
  }
}

const MiningBox = ({ node, children }: MiningBoxProps) => {
  const dispatch = useAppDispatch()

  const nodeState: MiningNodeStates = useAppSelector(state =>
    selectMiningNode(state, node),
  )

  const defaultConfig = {
    title: `${node.substring(0, 1).toUpperCase() + node.substring(1)} Mining`,
  }

  const defaultStates: Partial<{
    [key in keyof typeof MiningNodesStatus]: Config
  }> = {
    UNKNOWN: {},
    SETUP_REQUIRED: {
      tag: {
        text: 'Start here',
      },
    },
    ERROR: {
      tag: {
        text: 'Problem',
        type: 'warning',
      },
    },
  }

  const currentState = {
    ...defaultConfig,
    ...defaultStates[nodeState.status],
  }

  const componentForCurrentStatus = () => {
    if (children) {
      return children
    }

    switch (nodeState.status) {
      case 'UNKNOWN':
        return (
          <div>
            <Text>Unknown</Text>
            <button
              onClick={() =>
                dispatch(
                  actions.setNodeStatus({
                    node: node,
                    status: MiningNodesStatus.SETUP_REQUIRED,
                  }),
                )
              }
            >
              Next
            </button>
          </div>
        )
      case 'SETUP_REQUIRED':
        return (
          <div>
            <Text>Setup required</Text>
            <button
              onClick={() =>
                dispatch(
                  actions.setNodeStatus({
                    node: node,
                    status: MiningNodesStatus.ERROR,
                  }),
                )
              }
            >
              Next
            </button>
          </div>
        )
      case 'ERROR':
        return (
          <div>
            <Text>Error</Text>
            <button
              onClick={() =>
                dispatch(
                  actions.setNodeStatus({
                    node: node,
                    status: MiningNodesStatus.PAUSED,
                  }),
                )
              }
            >
              Next
            </button>
          </div>
        )
      case 'PAUSED':
        return (
          <div>
            <Text>Paused</Text>
            <button
              onClick={() => dispatch(actions.startMiningNode({ node: node }))}
            >
              Start
            </button>
          </div>
        )
      case 'RUNNING':
        return (
          <div>
            <Text>Running</Text>
            <button
              onClick={() => dispatch(actions.stopMiningNode({ node: node }))}
            >
              Stop
            </button>
          </div>
        )
    }
  }

  console.log('MINING BOX a', node, nodeState.status)

  const content = componentForCurrentStatus()

  return (
    <NodeBox title={currentState.title} tag={currentState.tag}>
      {content}
      {nodeState.pending ? <Text>Pending...</Text> : null}
    </NodeBox>
  )
}

export default MiningBox
