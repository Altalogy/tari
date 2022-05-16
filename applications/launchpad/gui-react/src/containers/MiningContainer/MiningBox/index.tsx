import { useTheme } from 'styled-components'
import deepmerge from 'deepmerge'

import Button from '../../../components/Button'
import CoinsList from '../../../components/CoinsList'
import NodeBox, { NodeBoxContentPlaceholder } from '../../../components/NodeBox'

import { useAppDispatch } from '../../../store/hooks'

import { actions } from '../../../store/mining'
import { MiningSession } from '../../../store/mining/types'

import t from '../../../locales'

import { MiningBoxProps, MiningBoxStatus, NodeBoxStatusConfig } from './types'
import { MiningBoxContent, NodeIcons } from './styles'
import { useMemo } from 'react'

const parseLastSessionToCoins = (lastSession: MiningSession | undefined) => {
  if (lastSession && lastSession.total) {
    return Object.keys(lastSession.total).map(coin => ({
      unit: coin,
      amount:
        lastSession.total && lastSession.total[coin]
          ? lastSession.total[coin]
          : '0',
      loading: true,
      suffixText: t.mining.minedInLastSession,
    }))
  }

  return []
}

/**
 * Generic component providing NodeBox-based UI, reading from global state
 * and handling basic actions.
 *
 * The `node` param determines which record in the global mining state
 * will be observed. The component will try automatically cast the found data
 * to the UI.
 *
 * The container handles `MiningNodesStatus` states automatically, but specific states
 * should be overwritten with two params:
 * - `statuses` - customi UI for a given node status
 * - `children` - override the content of the node box. Use this for statuses like `SETUP_REQUIRED` to provide
 *                details and steps how to resolve this status.
 *
 * The general approach is:
 * 1. Create parent container for specific node (ie. Tari Mining)
 * 2. Import and render this MiningBox Container with minimal config (ie. `{ node: 'tari' }`)
 * 3. Add in parent container any custom logic that will evaluate the correct status. If it's needed to provide
 *    custom component and logic for a given status, push children component (it will override generic component and behaviour).
 *
 * @param {MiningNodeType} node - ie. tari, merged
 * @param {Record<keyof MiningNodesStatus, NodeBoxStatusConfig>} [statuses] - the optional config overriding specific states.
 * @param {ReactNode} [children] - component overriding the generic one composed by this container for a given status./
 */
const MiningBox = ({
  node,
  icons,
  statuses,
  currentStatus,
  children,
  testId = 'mining-box-cmp',
  nodeState,
  containersState,
}: MiningBoxProps) => {
  const dispatch = useAppDispatch()
  const theme = useTheme()

  let theCurrentStatus = currentStatus

  if (!theCurrentStatus) {
    if (
      containersState.error ||
      containersState.dependsOn?.some(c => c.error)
    ) {
      theCurrentStatus = MiningBoxStatus.Error
    } else if (containersState.running) {
      theCurrentStatus = MiningBoxStatus.Running
    } else {
      theCurrentStatus = MiningBoxStatus.Paused
    }
  }

  const lastSession = nodeState.sessions
    ? nodeState.sessions[nodeState.sessions.length - 1]
    : undefined

  const coins = parseLastSessionToCoins(lastSession)

  // Is there any outgoing action, so the buttons should be disabled?
  const disableActions = containersState.pending

  const defaultConfig: NodeBoxStatusConfig = {
    title: `${node.substring(0, 1).toUpperCase() + node.substring(1)} ${
      t.common.nouns.mining
    }`,
    boxStyle: {
      color: theme.primary,
      background: theme.background,
    },
    titleStyle: {
      color: theme.primary,
    },
    contentStyle: {
      color: theme.secondary,
    },
    icon: {
      color: theme.backgroundImage,
    },
  }

  const defaultStates: Partial<{
    [key in MiningBoxStatus]: NodeBoxStatusConfig
  }> = {
    [MiningBoxStatus.SetupRequired]: {
      tag: {
        text: t.common.phrases.startHere,
      },
      boxStyle: {
        boxShadow: theme.shadow,
        borderColor: 'transparent',
      },
    },
    [MiningBoxStatus.Paused]: {
      tag: {
        text: t.common.adjectives.paused,
        type: 'light',
      },
    },
    [MiningBoxStatus.Running]: {
      tag: {
        text: t.common.adjectives.running,
        type: 'running',
      },
      boxStyle: {
        background: theme.tariGradient,
      },
      titleStyle: {
        color: theme.inverted.primary,
      },
      contentStyle: {
        color: theme.inverted.secondary,
      },
      icon: {
        color: theme.accentDark,
      },
    },
    [MiningBoxStatus.Error]: {
      tag: {
        text: t.common.nouns.problem,
        type: 'warning',
      },
    },
  }

  const currentState = useMemo(
    () =>
      deepmerge.all([
        defaultConfig,
        theCurrentStatus ? defaultStates[theCurrentStatus]! : {},
        theCurrentStatus && statuses && statuses[theCurrentStatus]
          ? statuses[theCurrentStatus]!
          : {},
      ]) as NodeBoxStatusConfig,
    [theCurrentStatus, nodeState],
  )

  const componentForCurrentStatus = () => {
    if (children) {
      return children
    }

    switch (theCurrentStatus) {
      case MiningBoxStatus.SetupRequired:
        return (
          <NodeBoxContentPlaceholder testId='node-box-placeholder--setup-required'>
            {t.mining.placeholders.statusSetupRequired}
          </NodeBoxContentPlaceholder>
        )
      case MiningBoxStatus.Error:
        return (
          <NodeBoxContentPlaceholder testId='node-box-placeholder--error'>
            <MiningBoxContent>
              {coins ? <CoinsList coins={coins} /> : null}
              <Button
                onClick={() =>
                  dispatch(actions.startMiningNode({ node: node }))
                }
                disabled={disableActions}
                loading={disableActions}
                testId={`${node}-run-btn`}
              >
                {t.mining.actions.startMining}
              </Button>
              <div>{t.mining.placeholders.statusError}</div>
            </MiningBoxContent>
          </NodeBoxContentPlaceholder>
        )
      case MiningBoxStatus.Paused:
        return (
          <MiningBoxContent data-testid='mining-box-paused-content'>
            {coins ? <CoinsList coins={coins} /> : null}
            <Button
              onClick={() => dispatch(actions.startMiningNode({ node: node }))}
              disabled={disableActions}
              loading={disableActions}
              testId={`${node}-run-btn`}
            >
              {t.mining.actions.startMining}
            </Button>
          </MiningBoxContent>
        )
      case MiningBoxStatus.Running:
        return (
          <MiningBoxContent data-testid='mining-box-running-content'>
            {coins ? (
              <CoinsList coins={coins} color={theme.inverted.primary} />
            ) : null}
            <Button
              variant='primary'
              onClick={() => dispatch(actions.stopMiningNode({ node: node }))}
              disabled={disableActions}
              loading={disableActions}
              testId={`${node}-pause-btn`}
            >
              {t.common.verbs.pause}
            </Button>
          </MiningBoxContent>
        )
    }
  }

  const content = componentForCurrentStatus()

  return (
    <NodeBox
      title={currentState.title}
      tag={currentState.tag}
      style={{ position: 'relative', ...currentState.boxStyle }}
      titleStyle={currentState.titleStyle}
      contentStyle={currentState.contentStyle}
      testId={testId}
    >
      {icons && icons.length > 0 ? (
        <NodeIcons
          $color={currentState.icon?.color || theme.backgroundSecondary}
        >
          {icons.map(icon => icon)}
        </NodeIcons>
      ) : null}
      {content}
    </NodeBox>
  )
}

export default MiningBox
