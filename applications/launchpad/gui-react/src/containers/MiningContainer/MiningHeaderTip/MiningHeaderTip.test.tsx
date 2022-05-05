import { render, screen } from '@testing-library/react'
import { Provider } from 'react-redux'
import { configureStore } from '@reduxjs/toolkit'
import { ThemeProvider } from 'styled-components'

import MiningHeaderTip from '.'

import themes from '../../../styles/themes'
import t from '../../../locales'
import { rootReducer } from '../../../store'
import { initialState as miningInitialState } from '../../../store/mining/index'
import { MiningNodesStatus } from '../../../store/mining/types'

describe('MiningHeaderTip', () => {
  it('should render "one step away"', () => {
    const miningState = {
      ...miningInitialState,
      tari: {
        pending: false,
        status: MiningNodesStatus.SETUP_REQUIRED,
        sessions: [
          {
            total: {
              xtr: '1000',
            },
          },
          {
            total: {
              xtr: '2000',
            },
          },
        ],
      },
      merged: {
        pending: false,
        status: MiningNodesStatus.PAUSED,
      },
    }

    render(
      <Provider
        store={configureStore({
          reducer: rootReducer,
          preloadedState: {
            mining: {
              ...miningState,
            },
          },
        })}
      >
        <ThemeProvider theme={themes.light}>
          <MiningHeaderTip />
        </ThemeProvider>
      </Provider>,
    )

    const el = screen.getByText(t.mining.headerTips.oneStepAway)
    expect(el).toBeInTheDocument()
  })

  it('should render "continue mining"', () => {
    const miningState = {
      ...miningInitialState,
      tari: {
        pending: false,
        status: MiningNodesStatus.PAUSED,
        sessions: [
          {
            total: {
              xtr: '1000',
            },
          },
          {
            total: {
              xtr: '2000',
            },
          },
        ],
      },
      merged: {
        pending: false,
        status: MiningNodesStatus.PAUSED,
      },
    }

    render(
      <Provider
        store={configureStore({
          reducer: rootReducer,
          preloadedState: {
            mining: {
              ...miningState,
            },
          },
        })}
      >
        <ThemeProvider theme={themes.light}>
          <MiningHeaderTip />
        </ThemeProvider>
      </Provider>,
    )

    const el = screen.getByText(t.mining.headerTips.continueMining)
    expect(el).toBeInTheDocument()
  })

  it('should render "running on"', () => {
    const miningState = {
      ...miningInitialState,
      tari: {
        pending: false,
        status: MiningNodesStatus.RUNNING,
        sessions: [
          {
            total: {
              xtr: '1000',
            },
          },
          {
            total: {
              xtr: '2000',
            },
          },
        ],
      },
      merged: {
        pending: false,
        status: MiningNodesStatus.PAUSED,
      },
    }

    render(
      <Provider
        store={configureStore({
          reducer: rootReducer,
          preloadedState: {
            mining: {
              ...miningState,
            },
          },
        })}
      >
        <ThemeProvider theme={themes.light}>
          <MiningHeaderTip />
        </ThemeProvider>
      </Provider>,
    )

    const el = screen.getByText(t.mining.headerTips.runningOn)
    expect(el).toBeInTheDocument()
  })
})
