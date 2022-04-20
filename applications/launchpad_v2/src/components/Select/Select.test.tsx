import React from 'react'
import { act, render, screen } from '@testing-library/react'
import { ThemeProvider } from 'styled-components'

import themes from '../../styles/themes'
import { Select } from './Select'

test('renders label with select', async () => {
  // given
  const options = [{
    value: 'Test value',
    key: 'test',
    label: 'Test label',
  }]

  // when
  await act(async () => {
    render(<ThemeProvider theme={themes.lightTheme}><Select label="Test select label" value={options[0]} options={options} onChange={() => null} /></ThemeProvider>)
  })

  // then
  const label = screen.getByText(/Test select label/i)
  expect(label).toBeInTheDocument()
})

test('render selected option', async () => {
  // given
  const options = [{
    value: 'Test value',
    key: 'test',
    label: 'Test label',
  }]

  // when
  await act(async () => {
    render(<ThemeProvider theme={themes.lightTheme}><Select label="Test select label" value={options[0]} options={options} onChange={() => null} /></ThemeProvider>)
  })

  // then
  const label = screen.getByText(/Test label/i)
  expect(label).toBeInTheDocument()
})
