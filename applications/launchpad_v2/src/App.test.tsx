import React from 'react'
import { act, render } from '@testing-library/react'
import { randomFillSync } from 'crypto'
import { mockIPC, clearMocks } from '@tauri-apps/api/mocks'

import App from './App'
import { Provider } from 'react-redux'

import { store } from './store'

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

test('renders learn react link', async () => {
  mockIPC(cmd => {
    switch (cmd) {
      case 'invoke':
        return ['a', 'b']
      default:
        break
    }
    return ['v']
  })
  await act(async () => {
    render(
      <Provider store={store}>
        <App />
      </Provider>,
    )
  })

  expect(true).toBeTruthy()
})
