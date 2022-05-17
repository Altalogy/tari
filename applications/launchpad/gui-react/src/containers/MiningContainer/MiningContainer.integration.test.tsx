// import { fireEvent, render, screen, waitFor } from '@testing-library/react'
// import { Provider } from 'react-redux'
// import { configureStore } from '@reduxjs/toolkit'
// import { ThemeProvider } from 'styled-components'
// import { randomFillSync } from 'crypto'
// import { clearMocks } from '@tauri-apps/api/mocks'

// import { tauriIPCMock } from '../../../__tests__/mocks/mockTauriIPC'

// import MiningContainer from '.'

// import themes from '../../styles/themes'

// import { rootReducer } from '../../store'
// import {
//   allStopped,
//   initialMining,
//   unlockedWallet,
// } from '../../../__tests__/mocks/states'

// const rootStateTemplate = {
//   wallet: unlockedWallet,
//   mining: initialMining,
//   containers: allStopped,
// }

// beforeAll(() => {
//   window.crypto = {
//     // @ts-expect-error: ignore this
//     getRandomValues: function (buffer) {
//       // @ts-expect-error: ignore this
//       return randomFillSync(buffer)
//     },
//   }
// })

// afterEach(() => {
//   clearMocks()
// })

describe('MiningContainer with Redux', () => {
  it('@TODO - test placeholder', () => {
    expect(true).toBe(true)
  })

  // it('should toggle the node status between running and paused', async () => {
  //   tauriIPCMock()

  //   render(
  //     <Provider
  //       store={configureStore({
  //         reducer: rootReducer,
  //         preloadedState: {
  //           ...rootStateTemplate,
  //         },
  //       })}
  //     >
  //       <ThemeProvider theme={themes.light}>
  //         <MiningContainer />
  //       </ThemeProvider>
  //     </Provider>,
  //   )

  //   const elRunBtn = screen.getByTestId('tari-run-btn')
  //   expect(elRunBtn).toBeInTheDocument()

  //   fireEvent.click(elRunBtn)
  //   await waitFor(() => screen.findByTestId('tari-pause-btn'), {
  //     timeout: 5000,
  //   })

  //   expect(await screen.findByTestId('tari-pause-btn')).toBeInTheDocument()
  //   const elPauseBtn = screen.getByTestId('tari-pause-btn')

  //   fireEvent.click(elPauseBtn)
  //   await waitFor(() => screen.findByTestId('tari-run-btn'), {
  //     timeout: 5000,
  //   })

  //   elRunBtn = await screen.getByTestId('tari-run-btn')
  //   expect(elRunBtn).toBeInTheDocument()
  // }, 20000)
})

export {}
