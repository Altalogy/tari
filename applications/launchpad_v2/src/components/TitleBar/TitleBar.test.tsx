import { fireEvent, render, screen } from '@testing-library/react'
import { Provider } from 'react-redux'
import { randomFillSync } from 'crypto'
import { mockIPC, clearMocks } from '@tauri-apps/api/mocks'

import TitleBar from '.'

import { store } from '../../store'
import { ThemeProvider } from 'styled-components'
import themes from '../../styles/themes'

beforeAll(() => {
  window.crypto = {
    getRandomValues: function (buffer) {
      return randomFillSync(buffer)
    },
  }
})

afterEach(() => {
  clearMocks()
})

describe('TitleBar', () => {
  it('should render all required components', () => {
    render(
      <Provider store={store}>
        <ThemeProvider theme={themes.light}>
          <TitleBar />
        </ThemeProvider>
      </Provider>,
    )

    mockIPC(cmd => {
      switch (cmd) {
        case 'tauri':
          return true
        default:
          break
      }
      return false
    })

    const closeWindowBtn = screen.getByTestId('close-window-btn')
    expect(closeWindowBtn).toBeInTheDocument()
    fireEvent.click(closeWindowBtn)

    const minWindowBtn = screen.getByTestId('minimize-window-btn')
    expect(minWindowBtn).toBeInTheDocument()
    fireEvent.click(minWindowBtn)

    const maxWindowBtn = screen.getByTestId('maximize-window-btn')
    expect(maxWindowBtn).toBeInTheDocument()
    fireEvent.click(maxWindowBtn)

    const expertViewBtn = screen.getByTestId('titlebar-expert-view-btn')
    expect(expertViewBtn).toBeInTheDocument()
    fireEvent.click(expertViewBtn)

    fireEvent.click(expertViewBtn)
  })
})
